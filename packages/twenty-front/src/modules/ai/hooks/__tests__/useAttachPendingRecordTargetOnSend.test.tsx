import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useAttachPendingRecordTargetOnSend } from '@/ai/hooks/useAttachPendingRecordTargetOnSend';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatPendingRecordTargetByDraftKeyState } from '@/ai/states/agentChatPendingRecordTargetByDraftKeyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const attachChatThreadToRecord = jest.fn(() => Promise.resolve(true));

jest.mock('@/ai/hooks/useChatThreadRecordAttachmentActions', () => ({
  useChatThreadRecordAttachmentActions: () => ({ attachChatThreadToRecord }),
}));

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const COMPANY_TARGET = {
  objectNameSingular: 'company',
  recordId: '20202020-0000-4000-8000-000000000002',
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderAttachPendingRecordTargetOnSend = () =>
  renderHook(() => useAttachPendingRecordTargetOnSend(), { wrapper: Wrapper })
    .result;

describe('useAttachPendingRecordTargetOnSend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('files the new thread under the record the chat was started from, once', async () => {
    jotaiStore.set(agentChatPendingRecordTargetByDraftKeyState.atom, {
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: COMPANY_TARGET,
    });
    const result = renderAttachPendingRecordTargetOnSend();

    await act(async () => {
      result.current.movePendingRecordTargetToThread({
        draftKey: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
        threadId: THREAD_ID,
      });
      await result.current.attachPendingRecordTargetOnSend({
        threadId: THREAD_ID,
      });
      await result.current.attachPendingRecordTargetOnSend({
        threadId: THREAD_ID,
      });
    });

    expect(attachChatThreadToRecord).toHaveBeenCalledTimes(1);
    expect(attachChatThreadToRecord).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      ...COMPANY_TARGET,
    });
    expect(
      jotaiStore.get(agentChatPendingRecordTargetByDraftKeyState.atom),
    ).toEqual({});
  });

  it('keeps the record with the thread when the first send fails, so the retry attaches it', async () => {
    jotaiStore.set(agentChatPendingRecordTargetByDraftKeyState.atom, {
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: COMPANY_TARGET,
    });
    const result = renderAttachPendingRecordTargetOnSend();

    // The first send creates the thread, then fails before attaching.
    act(() => {
      result.current.movePendingRecordTargetToThread({
        draftKey: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
        threadId: THREAD_ID,
      });
    });

    expect(
      jotaiStore.get(agentChatPendingRecordTargetByDraftKeyState.atom),
    ).toEqual({ [THREAD_ID]: COMPANY_TARGET });

    await act(async () => {
      await result.current.attachPendingRecordTargetOnSend({
        threadId: THREAD_ID,
      });
    });

    expect(attachChatThreadToRecord).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      ...COMPANY_TARGET,
    });
  });

  it('retries a failed attach on the next send', async () => {
    attachChatThreadToRecord.mockResolvedValueOnce(false);
    jotaiStore.set(agentChatPendingRecordTargetByDraftKeyState.atom, {
      [THREAD_ID]: COMPANY_TARGET,
    });
    const result = renderAttachPendingRecordTargetOnSend();

    await act(async () => {
      await result.current.attachPendingRecordTargetOnSend({
        threadId: THREAD_ID,
      });
    });

    expect(
      jotaiStore.get(agentChatPendingRecordTargetByDraftKeyState.atom),
    ).toEqual({ [THREAD_ID]: COMPANY_TARGET });

    await act(async () => {
      await result.current.attachPendingRecordTargetOnSend({
        threadId: THREAD_ID,
      });
    });

    expect(attachChatThreadToRecord).toHaveBeenCalledTimes(2);
    expect(
      jotaiStore.get(agentChatPendingRecordTargetByDraftKeyState.atom),
    ).toEqual({});
  });

  it('leaves a chat that was not started from a record alone', async () => {
    const result = renderAttachPendingRecordTargetOnSend();

    await act(async () => {
      await result.current.attachPendingRecordTargetOnSend({
        threadId: THREAD_ID,
      });
    });

    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });
});
