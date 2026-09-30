import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AgentChatThreadRecordOperationsEffect } from '@/ai/components/AgentChatThreadRecordOperationsEffect';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
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
const addAgentChatThread = jest.fn();
const refreshAgentChatThreads = jest.fn();
const leaveRemovedAiChatThread = jest.fn();
const useListenToEventsForQuery = jest.fn();

jest.mock('@/ai/hooks/useApplyAgentChatThreadUpdate', () => ({
  useApplyAgentChatThreadUpdate: () => ({
    applyAgentChatThreadUpdate,
    addAgentChatThread,
  }),
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
    jotaiStore.set(agentChatThreadListState.atom, {
      threadIds: [CHAT_ID],
      hasNextPage: true,
      endCursor: 'page-1',
    });
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

  it('applies renames and usage updates to the stored chat', () => {
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
      totalInputTokens: 12,
    });
    expect(refreshAgentChatThreads).not.toHaveBeenCalled();
  });

  it('reloads the list when a chat past the loaded pages is updated', () => {
    dispatchChatOperation({
      type: 'update-one',
      result: {
        updateInput: {
          recordId: 'older-chat',
          updatedFields: [{ title: 'Renamed' }],
        },
      },
    });

    expect(refreshAgentChatThreads).toHaveBeenCalledTimes(1);
  });

  it('lists a created chat but leaves a workflow run conversation to its run', () => {
    dispatchChatOperation({
      type: 'create-one',
      createdRecord: { id: CHAT_ID, workflowRunId: null },
    });

    expect(addAgentChatThread).toHaveBeenCalledWith({
      id: CHAT_ID,
      workflowRunId: null,
    });

    dispatchChatOperation({
      type: 'create-one',
      createdRecord: { id: 'run-conversation', workflowRunId: 'run' },
    });

    expect(addAgentChatThread).toHaveBeenCalledTimes(1);
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

  it('reads the chats again after a destroy and leaves a chat that is gone, even when the reload fails', async () => {
    refreshAgentChatThreads.mockResolvedValue(undefined);

    dispatchChatOperation({ type: 'destroy-one' });

    await act(async () => {
      await Promise.resolve();
    });

    expect(refreshAgentChatThreads).toHaveBeenCalledTimes(1);
    expect(leaveRemovedAiChatThread).toHaveBeenCalledTimes(1);
  });

  it('reads the chats again after the event stream reconnects', async () => {
    const { onSseReconnected } = useListenToEventsForQuery.mock.calls[0][0];

    await act(() => onSseReconnected());

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
