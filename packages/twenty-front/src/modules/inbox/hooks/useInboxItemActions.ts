import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { EXECUTE_INBOX_ITEM_ACTION } from '@/inbox/graphql/mutations/executeInboxItemAction';
import { MARK_INBOX_ITEM_READ } from '@/inbox/graphql/mutations/markInboxItemRead';
import { TRANSITION_INBOX_ITEM } from '@/inbox/graphql/mutations/transitionInboxItem';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type InboxItem } from '~/generated/graphql';
import { logError } from '~/utils/logError';

const INBOX_REFETCH_QUERIES = ['GetMyInboxItems', 'GetMyInboxCounts'];

type InboxItemTransitionInput = {
  kind: string;
  outcome?: string;
  result?: Record<string, unknown>;
  resurfaceInMinutes?: number;
  toUserWorkspaceId?: string | null;
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
  >(MARK_INBOX_ITEM_READ, mutationOptions);

  const [transitionInboxItemMutation] = useMutation<
    { transitionInboxItem: InboxItem },
    {
      inboxItemId: string;
      transition: InboxItemTransitionInput;
      expectedVersion?: number;
    }
  >(TRANSITION_INBOX_ITEM, mutationOptions);

  const [executeInboxItemActionMutation] = useMutation<
    { executeInboxItemAction: InboxItem },
    {
      inboxItemId: string;
      actionKey: string;
      input?: Record<string, unknown>;
      expectedVersion?: number;
    }
  >(EXECUTE_INBOX_ITEM_ACTION, mutationOptions);

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

  // The one way an item changes state. Everything else is a named shortcut to
  // a transition, resolved server side from the type's declared actions.
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

  const executeInboxItemAction = useCallback(
    async ({
      inboxItemId,
      actionKey,
      input,
      expectedVersion,
    }: {
      inboxItemId: string;
      actionKey: string;
      input?: Record<string, unknown>;
      expectedVersion?: number;
    }) => {
      await executeInboxItemActionMutation({
        variables: { inboxItemId, actionKey, input, expectedVersion },
      });
    },
    [executeInboxItemActionMutation],
  );

  return {
    markInboxItemRead,
    transitionInboxItem,
    assignInboxItem,
    reopenInboxItem,
    executeInboxItemAction,
  };
};
