import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AgentChatThreadRecordOperationsEffect } from '@/ai/components/AgentChatThreadRecordOperationsEffect';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const CHAT_OBJECT_METADATA_ITEM = {
  id: 'chat-object-metadata-id',
  nameSingular: 'agentChatThread',
} as EnrichedObjectMetadataItem;
const OTHER_OBJECT_METADATA_ITEM = {
  id: 'company-object-metadata-id',
  nameSingular: 'company',
} as EnrichedObjectMetadataItem;
const CHAT_ID = '20202020-0000-4000-8000-0000000000aa';

const applyAgentChatThreadUpdate = jest.fn();
const refreshAgentChatThreads = jest.fn();
const leaveRemovedAiChatThread = jest.fn();
const useListenToEventsForQuery = jest.fn();

jest.mock('@/ai/hooks/useApplyAgentChatThreadUpdate', () => ({
  useApplyAgentChatThreadUpdate: () => ({ applyAgentChatThreadUpdate }),
}));
jest.mock('@/ai/hooks/useRefreshAgentChatThreads', () => ({
  useRefreshAgentChatThreads: () => ({ refreshAgentChatThreads }),
}));
jest.mock('@/ai/hooks/useLeaveRemovedAiChatThread', () => ({
  useLeaveRemovedAiChatThread: () => ({ leaveRemovedAiChatThread }),
}));
jest.mock('@/sse-db-event/hooks/useListenToEventsForQuery', () => ({
  useListenToEventsForQuery: (params: unknown) =>
    useListenToEventsForQuery(params),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: () => CHAT_OBJECT_METADATA_ITEM,
  }),
);

const dispatchChatOperation = (
  operation: Parameters<
    typeof dispatchObjectRecordOperationBrowserEvent
  >[0]['operation'],
  objectMetadataItem = CHAT_OBJECT_METADATA_ITEM,
) =>
  act(() => {
    dispatchObjectRecordOperationBrowserEvent({
      objectMetadataItem,
      operation,
    });
  });

describe('AgentChatThreadRecordOperationsEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    refreshAgentChatThreads.mockResolvedValue([]);
    render(
      <JotaiProvider store={jotaiStore}>
        <AgentChatThreadRecordOperationsEffect />
      </JotaiProvider>,
    );
  });

  it("listens to every chat the member can read, including other tabs'", () => {
    expect(useListenToEventsForQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        operationSignature: {
          objectNameSingular: 'agentChatThread',
          variables: {},
        },
        skip: false,
      }),
    );
  });

  it('applies a rename to the listed chat, ignoring fields the list does not hold', () => {
    dispatchChatOperation({
      type: 'update-one',
      result: {
        updateInput: {
          recordId: CHAT_ID,
          updatedFields: [{ title: 'Renamed' }, { totalInputTokens: 12 }],
        },
      },
    });

    expect(applyAgentChatThreadUpdate).toHaveBeenCalledWith({
      id: CHAT_ID,
      title: 'Renamed',
    });
  });

  it('ignores updates that do not change the list', () => {
    dispatchChatOperation({
      type: 'update-one',
      result: {
        updateInput: {
          recordId: CHAT_ID,
          updatedFields: [{ totalInputTokens: 12 }],
        },
      },
    });

    expect(applyAgentChatThreadUpdate).not.toHaveBeenCalled();
  });

  it('marks deleted chats and clears the mark on restore', () => {
    dispatchChatOperation({ type: 'delete-one', deletedRecordId: CHAT_ID });

    expect(applyAgentChatThreadUpdate).toHaveBeenLastCalledWith({
      id: CHAT_ID,
      deletedAt: expect.any(String),
    });

    dispatchChatOperation({
      type: 'restore-one',
      restoredRecord: { id: CHAT_ID },
    });

    expect(applyAgentChatThreadUpdate).toHaveBeenLastCalledWith({
      id: CHAT_ID,
      deletedAt: null,
    });
  });

  it('reads the chats again after a destroy and leaves a chat that is gone', async () => {
    dispatchChatOperation({ type: 'destroy-one' });

    await act(async () => {
      await Promise.resolve();
    });

    expect(refreshAgentChatThreads).toHaveBeenCalledTimes(1);
    expect(leaveRemovedAiChatThread).toHaveBeenCalledTimes(1);
  });

  it('ignores operations on other objects', () => {
    dispatchChatOperation(
      { type: 'delete-one', deletedRecordId: CHAT_ID },
      OTHER_OBJECT_METADATA_ITEM,
    );

    expect(applyAgentChatThreadUpdate).not.toHaveBeenCalled();
  });
});
