import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { CREATE_INBOX_ITEM_TOOL_CALL } from '@/inbox/graphql/mutations/createInboxItemToolCall';
import { MARK_INBOX_ITEM_READ } from '@/inbox/graphql/mutations/markInboxItemRead';
import { RUN_INBOX_ITEM_TOOL_CALL } from '@/inbox/graphql/mutations/runInboxItemToolCall';
import { RUN_INBOX_ITEM_TOOL_CALLS } from '@/inbox/graphql/mutations/runInboxItemToolCalls';
import { SET_INBOX_ITEM_TOOL_CALL_REJECTED } from '@/inbox/graphql/mutations/setInboxItemToolCallRejected';
import { UPDATE_INBOX_ITEM_TOOL_CALL_INPUT } from '@/inbox/graphql/mutations/updateInboxItemToolCallInput';
import { TRANSITION_INBOX_ITEM } from '@/inbox/graphql/mutations/transitionInboxItem';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  type InboxItem,
  type InboxItemField,
  type InboxItemToolCall,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';

// A transition can move an item between scopes, so the list has to be re-read.
// Marking read cannot: it only flips isUnread on a row the cache already holds,
// which the mutation's own payload updates.
const INBOX_REFETCH_QUERIES = ['GetMyInboxItems', 'GetMyInboxCounts'];

type InboxItemTransitionKind = 'CLEAR' | 'REOPEN' | 'ASSIGN' | 'MOVE';

type InboxItemTransitionInput = {
  kind: InboxItemTransitionKind;
  resurfaceAt?: string;
  toUserWorkspaceId?: string | null;
  toQueueId?: string | null;
};

export const useInboxItemActions = () => {
  const apolloCoreClient = useApolloCoreClient();

  const mutationOptions = {
    client: apolloCoreClient,
    refetchQueries: INBOX_REFETCH_QUERIES,
  };

  const [markInboxItemReadMutation] = useMutation<
    { markInboxItemRead: InboxItem },
    { inboxItemId: string }
  >(MARK_INBOX_ITEM_READ, {
    client: apolloCoreClient,
    refetchQueries: ['GetMyInboxCounts'],
  });

  const [transitionInboxItemMutation] = useMutation<
    { transitionInboxItem: InboxItem },
    {
      inboxItemId: string;
      transition: InboxItemTransitionInput;
      expectedVersion?: number;
    }
  >(TRANSITION_INBOX_ITEM, mutationOptions);

  // Memoized because an effect marks an item read on open, and a function
  // whose identity changed every render would fire that mutation repeatedly.
  const markInboxItemRead = useCallback(
    async ({ inboxItemId }: { inboxItemId: string }) => {
      try {
        await markInboxItemReadMutation({ variables: { inboxItemId } });
      } catch (error) {
        logError(error);
      }
    },
    [markInboxItemReadMutation],
  );

  const transitionInboxItem = useCallback(
    async ({
      inboxItemId,
      transition,
      expectedVersion,
    }: {
      inboxItemId: string;
      transition: InboxItemTransitionInput;
      expectedVersion?: number;
    }) => {
      await transitionInboxItemMutation({
        variables: { inboxItemId, transition, expectedVersion },
      });
    },
    [transitionInboxItemMutation],
  );

  // Taking, handing over and giving back are the same transition with a
  // different target, so the UI offers three buttons over one mutation.
  const assignInboxItem = useCallback(
    async ({
      inboxItemId,
      toUserWorkspaceId,
      expectedVersion,
    }: {
      inboxItemId: string;
      // Omitted takes the item; null gives it back to the queue.
      toUserWorkspaceId?: string | null;
      expectedVersion?: number;
    }) =>
      transitionInboxItemMutation({
        variables: {
          inboxItemId,
          transition: {
            kind: 'ASSIGN',
            ...(toUserWorkspaceId === undefined ? {} : { toUserWorkspaceId }),
          },
          expectedVersion,
        },
      }),
    [transitionInboxItemMutation],
  );

  // Which inbox the work sits in, which is a different question from who is
  // doing it, so it is its own call rather than another argument to assign.
  const moveInboxItem = useCallback(
    async ({
      inboxItemId,
      toQueueId,
      expectedVersion,
    }: {
      inboxItemId: string;
      toQueueId: string | null;
      expectedVersion?: number;
    }) =>
      transitionInboxItemMutation({
        variables: {
          inboxItemId,
          transition: { kind: 'MOVE', toQueueId },
          expectedVersion,
        },
      }),
    [transitionInboxItemMutation],
  );

  const reopenInboxItem = useCallback(
    async ({
      inboxItemId,
      expectedVersion,
    }: {
      inboxItemId: string;
      expectedVersion?: number;
    }) =>
      transitionInboxItem({
        inboxItemId,
        transition: { kind: 'REOPEN' },
        expectedVersion,
      }),
    [transitionInboxItem],
  );

  // A row edit is a plain field write: no scope changes, so no list refetch.
  // The cache row is updated from the payload.
  const [updateInboxItemToolCallInputMutation] = useMutation<
    {
      updateInboxItemToolCallInput: Pick<
        InboxItemToolCall,
        'id' | 'status' | 'editedInput'
      >;
    },
    { inboxItemToolCallId: string; editedInput: Record<string, unknown> }
  >(UPDATE_INBOX_ITEM_TOOL_CALL_INPUT, { client: apolloCoreClient });

  const [setInboxItemToolCallRejectedMutation] = useMutation<
    {
      setInboxItemToolCallRejected: Pick<
        InboxItemToolCall,
        'id' | 'status' | 'editedInput'
      >;
    },
    { inboxItemToolCallId: string; isRejected: boolean }
  >(SET_INBOX_ITEM_TOOL_CALL_REJECTED, { client: apolloCoreClient });

  const [runInboxItemToolCallsMutation] = useMutation<
    { runInboxItemToolCalls: InboxItem },
    { inboxItemId: string; expectedVersion?: number }
  >(RUN_INBOX_ITEM_TOOL_CALLS, mutationOptions);

  const [runInboxItemToolCallMutation] = useMutation<
    { runInboxItemToolCall: InboxItem },
    { inboxItemToolCallId: string; expectedVersion?: number }
  >(RUN_INBOX_ITEM_TOOL_CALL, mutationOptions);

  // Adding a call changes what the item's query returns, so the item is
  // re-read rather than patched into the cache.
  const [createInboxItemToolCallMutation] = useMutation<
    { createInboxItemToolCall: InboxItemToolCall },
    {
      input: {
        inboxItemId: string;
        toolName: string;
        label: string;
        description?: string;
        icon?: string;
        inputSchema?: Omit<InboxItemField, '__typename'>[];
        proposedInput: Record<string, unknown>;
      };
    }
  >(CREATE_INBOX_ITEM_TOOL_CALL, {
    client: apolloCoreClient,
    refetchQueries: ['GetMyInboxItem'],
  });

  const updateInboxItemToolCallInput = useCallback(
    async ({
      inboxItemToolCallId,
      editedInput,
    }: {
      inboxItemToolCallId: string;
      editedInput: Record<string, unknown>;
    }) => {
      await updateInboxItemToolCallInputMutation({
        variables: { inboxItemToolCallId, editedInput },
      });
    },
    [updateInboxItemToolCallInputMutation],
  );

  const setInboxItemToolCallRejected = useCallback(
    async ({
      inboxItemToolCallId,
      isRejected,
    }: {
      inboxItemToolCallId: string;
      isRejected: boolean;
    }) => {
      await setInboxItemToolCallRejectedMutation({
        variables: { inboxItemToolCallId, isRejected },
      });
    },
    [setInboxItemToolCallRejectedMutation],
  );

  // The item comes back so a caller can tell a run that finished the plan
  // from one that left work behind, without another read.
  const runInboxItemToolCalls = useCallback(
    async ({
      inboxItemId,
      expectedVersion,
    }: {
      inboxItemId: string;
      expectedVersion?: number;
    }): Promise<InboxItem | undefined> => {
      const result = await runInboxItemToolCallsMutation({
        variables: { inboxItemId, expectedVersion },
      });

      return result.data?.runInboxItemToolCalls;
    },
    [runInboxItemToolCallsMutation],
  );

  const runInboxItemToolCall = useCallback(
    async ({
      inboxItemToolCallId,
      expectedVersion,
    }: {
      inboxItemToolCallId: string;
      expectedVersion?: number;
    }): Promise<InboxItem | undefined> => {
      const result = await runInboxItemToolCallMutation({
        variables: { inboxItemToolCallId, expectedVersion },
      });

      return result.data?.runInboxItemToolCall;
    },
    [runInboxItemToolCallMutation],
  );

  const createInboxItemToolCall = useCallback(
    async (input: {
      inboxItemId: string;
      toolName: string;
      label: string;
      description?: string;
      icon?: string;
      inputSchema?: Omit<InboxItemField, '__typename'>[];
      proposedInput: Record<string, unknown>;
    }): Promise<InboxItemToolCall | undefined> => {
      const result = await createInboxItemToolCallMutation({
        variables: { input },
      });

      return result.data?.createInboxItemToolCall;
    },
    [createInboxItemToolCallMutation],
  );

  return {
    markInboxItemRead,
    transitionInboxItem,
    assignInboxItem,
    moveInboxItem,
    reopenInboxItem,
    updateInboxItemToolCallInput,
    setInboxItemToolCallRejected,
    runInboxItemToolCalls,
    runInboxItemToolCall,
    createInboxItemToolCall,
  };
};
