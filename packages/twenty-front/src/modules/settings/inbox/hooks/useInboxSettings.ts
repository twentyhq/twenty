import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import {
  CREATE_INBOX_QUEUE,
  DELETE_INBOX_QUEUE,
  SET_INBOX_QUEUE_ROLES,
  UPDATE_INBOX_QUEUE,
} from '@/settings/inbox/graphql/inboxSettingsOperations';
import { useInboxQueueSettings } from '@/settings/inbox/hooks/useInboxQueueSettings';

const INBOX_SETTINGS_REFETCH_QUERIES = [
  'GetInboxQueueSettings',
  // The drawer's shared section follows these grants, so it changes too.
  'GetMyInboxQueues',
];

export const useInboxSettings = () => {
  const apolloCoreClient = useApolloCoreClient();

  const mutationOptions = {
    client: apolloCoreClient,
    refetchQueries: INBOX_SETTINGS_REFETCH_QUERIES,
  };

  const { inboxQueues, loading: queuesLoading } = useInboxQueueSettings();

  const [createInboxQueueMutation] = useMutation(
    CREATE_INBOX_QUEUE,
    mutationOptions,
  );
  const [updateInboxQueueMutation] = useMutation(
    UPDATE_INBOX_QUEUE,
    mutationOptions,
  );
  const [setInboxQueueRolesMutation] = useMutation(
    SET_INBOX_QUEUE_ROLES,
    mutationOptions,
  );
  const [deleteInboxQueueMutation] = useMutation(
    DELETE_INBOX_QUEUE,
    mutationOptions,
  );

  const createInboxQueue = useCallback(
    async (input: { label: string; icon?: string; roleIds: string[] }) => {
      await createInboxQueueMutation({ variables: { input } });
    },
    [createInboxQueueMutation],
  );

  const updateInboxQueue = useCallback(
    async (input: { queueId: string; label?: string; icon?: string }) => {
      await updateInboxQueueMutation({ variables: { input } });
    },
    [updateInboxQueueMutation],
  );

  const setInboxQueueRoles = useCallback(
    async (input: { queueId: string; roleIds: string[] }) => {
      await setInboxQueueRolesMutation({ variables: { input } });
    },
    [setInboxQueueRolesMutation],
  );

  const deleteInboxQueue = useCallback(
    async (queueId: string) => {
      await deleteInboxQueueMutation({ variables: { queueId } });
    },
    [deleteInboxQueueMutation],
  );

  return {
    inboxQueues,
    loading: queuesLoading,
    createInboxQueue,
    updateInboxQueue,
    setInboxQueueRoles,
    deleteInboxQueue,
  };
};
