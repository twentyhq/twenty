import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import {
  CREATE_INBOX_QUEUE,
  DELETE_INBOX_QUEUE,
  GET_INBOX_ITEM_TYPE_SETTINGS,
  GET_INBOX_QUEUE_SETTINGS,
  SET_INBOX_ITEM_TYPE_DEFAULT_QUEUE,
  SET_INBOX_QUEUE_MEMBERS,
  UPDATE_INBOX_QUEUE,
} from '@/settings/inbox/graphql/inboxSettingsOperations';
import {
  type InboxItemTypeSettings,
  type InboxQueueSettings,
} from '~/generated/graphql';

const INBOX_SETTINGS_REFETCH_QUERIES = [
  'GetInboxQueueSettings',
  'GetInboxItemTypeSettings',
  // The drawer's shared section is membership-driven, so it changes too
  'GetMyInboxQueues',
];

export const useInboxSettings = () => {
  const apolloCoreClient = useApolloCoreClient();

  // The queries are flag-guarded server-side, so asking with the flag off is a
  // GraphQL error rather than an empty list.
  const isInboxFeatureEnabled = useIsInboxEnabled();

  const mutationOptions = {
    client: apolloCoreClient,
    refetchQueries: INBOX_SETTINGS_REFETCH_QUERIES,
  };

  const { data: queuesData, loading: queuesLoading } = useQuery<{
    inboxQueueSettings: InboxQueueSettings[];
  }>(GET_INBOX_QUEUE_SETTINGS, {
    client: apolloCoreClient,
    skip: !isInboxFeatureEnabled,
  });

  const { data: typesData, loading: typesLoading } = useQuery<{
    inboxItemTypeSettings: InboxItemTypeSettings[];
  }>(GET_INBOX_ITEM_TYPE_SETTINGS, {
    client: apolloCoreClient,
    skip: !isInboxFeatureEnabled,
  });

  const [createInboxQueueMutation] = useMutation(
    CREATE_INBOX_QUEUE,
    mutationOptions,
  );
  const [updateInboxQueueMutation] = useMutation(
    UPDATE_INBOX_QUEUE,
    mutationOptions,
  );
  const [setInboxQueueMembersMutation] = useMutation(
    SET_INBOX_QUEUE_MEMBERS,
    mutationOptions,
  );
  const [deleteInboxQueueMutation] = useMutation(
    DELETE_INBOX_QUEUE,
    mutationOptions,
  );
  const [setInboxItemTypeDefaultQueueMutation] = useMutation(
    SET_INBOX_ITEM_TYPE_DEFAULT_QUEUE,
    mutationOptions,
  );

  const createInboxQueue = useCallback(
    async (input: {
      name: string;
      icon?: string;
      memberWorkspaceMemberIds: string[];
    }) => {
      await createInboxQueueMutation({ variables: { input } });
    },
    [createInboxQueueMutation],
  );

  const updateInboxQueue = useCallback(
    async (input: { queueId: string; name?: string; icon?: string }) => {
      await updateInboxQueueMutation({ variables: { input } });
    },
    [updateInboxQueueMutation],
  );

  const setInboxQueueMembers = useCallback(
    async (input: { queueId: string; memberWorkspaceMemberIds: string[] }) => {
      await setInboxQueueMembersMutation({ variables: { input } });
    },
    [setInboxQueueMembersMutation],
  );

  const deleteInboxQueue = useCallback(
    async (queueId: string) => {
      await deleteInboxQueueMutation({ variables: { queueId } });
    },
    [deleteInboxQueueMutation],
  );

  const setInboxItemTypeDefaultQueue = useCallback(
    async (input: {
      inboxItemTypeId: string;
      defaultQueueId: string | null;
    }) => {
      await setInboxItemTypeDefaultQueueMutation({ variables: { input } });
    },
    [setInboxItemTypeDefaultQueueMutation],
  );

  return {
    inboxQueues: queuesData?.inboxQueueSettings ?? [],
    inboxItemTypes: typesData?.inboxItemTypeSettings ?? [],
    loading: queuesLoading || typesLoading,
    createInboxQueue,
    updateInboxQueue,
    setInboxQueueMembers,
    deleteInboxQueue,
    setInboxItemTypeDefaultQueue,
  };
};
