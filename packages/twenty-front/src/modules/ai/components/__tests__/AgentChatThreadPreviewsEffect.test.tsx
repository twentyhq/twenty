import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AgentChatThreadPreviewsEffect } from '@/ai/components/AgentChatThreadPreviewsEffect';
import { agentChatThreadPreviewsState } from '@/ai/states/agentChatThreadPreviewsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const query = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ query }),
}));

const THREAD_ID = 'thread-1';

const buildPreview = (lastMessageText: string) => ({
  threadId: THREAD_ID,
  lastMessageRole: 'assistant',
  lastMessageText,
  lastMessageSenderWorkspaceMemberId: null,
  memberIds: [],
});

const createDeferred = () => {
  let resolve: (value: unknown) => void = () => {};
  let reject: (reason: unknown) => void = () => {};
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

const renderEffect = (lastActivityAt: string) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatThreadPreviewsEffect
      threads={[{ id: THREAD_ID, lastActivityAt }]}
    />
  </JotaiProvider>
);

const getEntry = () =>
  jotaiStore.get(agentChatThreadPreviewsState.atom)[THREAD_ID];

describe('AgentChatThreadPreviewsEffect', () => {
  beforeEach(() => {
    resetJotaiStore();
    query.mockReset();
  });

  it('keeps the preview of the latest activity when an older response lands last', async () => {
    const olderRequest = createDeferred();
    const newerRequest = createDeferred();

    query
      .mockReturnValueOnce(olderRequest.promise)
      .mockReturnValueOnce(newerRequest.promise);

    const { rerender } = render(renderEffect('2026-10-01T10:00:00.000Z'));

    rerender(renderEffect('2026-10-01T11:00:00.000Z'));

    await act(async () => {
      newerRequest.resolve({
        data: { agentChatThreadPreviews: [buildPreview('Newer')] },
      });
    });
    await act(async () => {
      olderRequest.resolve({
        data: { agentChatThreadPreviews: [buildPreview('Older')] },
      });
    });

    expect(getEntry()).toEqual({
      lastActivityAt: '2026-10-01T11:00:00.000Z',
      preview: buildPreview('Newer'),
    });
  });

  it('asks again after a failed refresh, keeping the previous preview meanwhile', async () => {
    const firstRequest = createDeferred();
    const failedRequest = createDeferred();

    query
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(failedRequest.promise)
      .mockReturnValueOnce(new Promise(() => {}));

    const { rerender } = render(renderEffect('2026-10-01T10:00:00.000Z'));

    await act(async () => {
      firstRequest.resolve({
        data: { agentChatThreadPreviews: [buildPreview('First')] },
      });
    });

    rerender(renderEffect('2026-10-01T11:00:00.000Z'));
    await act(async () => {
      failedRequest.reject(new Error('Network error'));
    });

    expect(getEntry()).toEqual({ preview: buildPreview('First') });

    rerender(renderEffect('2026-10-01T11:00:00.000Z'));

    expect(query).toHaveBeenCalledTimes(3);
  });
});
