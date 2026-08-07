import { useMutation } from '@apollo/client/react';

import { COMPLETE_INBOX_ITEM } from '@/inbox/graphql/mutations/completeInboxItem';
import { EXECUTE_INBOX_ITEM_ACTION } from '@/inbox/graphql/mutations/executeInboxItemAction';
import { MARK_INBOX_ITEM_READ } from '@/inbox/graphql/mutations/markInboxItemRead';
import { REOPEN_INBOX_ITEM } from '@/inbox/graphql/mutations/reopenInboxItem';
import { SNOOZE_INBOX_ITEM } from '@/inbox/graphql/mutations/snoozeInboxItem';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type InboxItem } from '~/generated/graphql';
import { logError } from '~/utils/logError';

const INBOX_REFETCH_QUERIES = ['GetMyInboxItems', 'GetMyInboxCounts'];

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

  const [snoozeInboxItemMutation] = useMutation<
    { snoozeInboxItem: InboxItem },
    { inboxItemId: string; snoozedUntil: string }
  >(SNOOZE_INBOX_ITEM, mutationOptions);

  const [completeInboxItemMutation] = useMutation<
    { completeInboxItem: InboxItem },
    { inboxItemId: string }
  >(COMPLETE_INBOX_ITEM, mutationOptions);

  const [reopenInboxItemMutation] = useMutation<
    { reopenInboxItem: InboxItem },
    { inboxItemId: string }
  >(REOPEN_INBOX_ITEM, mutationOptions);

  const [executeInboxItemActionMutation] = useMutation<
    { executeInboxItemAction: InboxItem },
    { inboxItemId: string; actionKey: string }
  >(EXECUTE_INBOX_ITEM_ACTION, mutationOptions);

  const markInboxItemRead = async (inboxItemId: string) => {
    try {
      await markInboxItemReadMutation({ variables: { inboxItemId } });
    } catch (error) {
      logError(error);
    }
  };

  const snoozeInboxItem = async (inboxItemId: string, snoozedUntil: string) => {
    try {
      await snoozeInboxItemMutation({
        variables: { inboxItemId, snoozedUntil },
      });
    } catch (error) {
      logError(error);
    }
  };

  const completeInboxItem = async (inboxItemId: string) => {
    try {
      await completeInboxItemMutation({ variables: { inboxItemId } });
    } catch (error) {
      logError(error);
    }
  };

  const reopenInboxItem = async (inboxItemId: string) => {
    try {
      await reopenInboxItemMutation({ variables: { inboxItemId } });
    } catch (error) {
      logError(error);
    }
  };

  const executeInboxItemAction = async (
    inboxItemId: string,
    actionKey: string,
  ) => {
    try {
      await executeInboxItemActionMutation({
        variables: { inboxItemId, actionKey },
      });
    } catch (error) {
      logError(error);
    }
  };

  return {
    markInboxItemRead,
    snoozeInboxItem,
    completeInboxItem,
    reopenInboxItem,
    executeInboxItemAction,
  };
};
