import { useMutation } from '@apollo/client/react';

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
  reason?: string;
  targetUserWorkspaceId?: string;
  durationMinutes?: number;
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

  const markInboxItemRead = async ({
    inboxItemId,
  }: {
    inboxItemId: string;
  }) => {
    try {
      await markInboxItemReadMutation({ variables: { inboxItemId } });
    } catch (error) {
      logError(error);
    }
  };

  // The one way an item changes state. Everything else is a named shortcut to
  // a transition, resolved server side from the type's declared actions.
  const transitionInboxItem = async ({
    inboxItemId,
    transition,
    expectedVersion,
  }: {
    inboxItemId: string;
    transition: InboxItemTransitionInput;
    expectedVersion?: number;
  }) => {
    try {
      await transitionInboxItemMutation({
        variables: { inboxItemId, transition, expectedVersion },
      });
    } catch (error) {
      logError(error);
    }
  };

  const reopenInboxItem = async ({
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
    });

  const executeInboxItemAction = async ({
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
    try {
      await executeInboxItemActionMutation({
        variables: { inboxItemId, actionKey, input, expectedVersion },
      });
    } catch (error) {
      logError(error);
    }
  };

  return {
    markInboxItemRead,
    transitionInboxItem,
    reopenInboxItem,
    executeInboxItemAction,
  };
};
