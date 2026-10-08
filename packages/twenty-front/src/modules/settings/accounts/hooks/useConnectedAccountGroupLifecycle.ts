import { useConnectedAccountAdministration } from '@/settings/accounts/hooks/useConnectedAccountAdministration';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import { type Reference } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  DeleteConnectedAccountDocument,
  DisconnectConnectedAccountDocument,
} from '~/generated-metadata/graphql';

export const useConnectedAccountGroupLifecycle = () => {
  const client = useApolloClient();
  const { enqueueToast } = useToast();
  const { canManageAccount } = useConnectedAccountAdministration();
  const [deleteAccount] = useMutation(DeleteConnectedAccountDocument);
  const [disconnectAccount] = useMutation(DisconnectConnectedAccountDocument);
  const [completedIds, setCompletedIds] = useState({
    delete: new Set<string>(),
    disconnect: new Set<string>(),
  });
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRefreshError, setHasRefreshError] = useState(false);
  const [lastOperation, setLastOperation] = useState<
    'delete' | 'disconnect' | null
  >(null);

  const resetGroupAction = () => {
    setCompletedIds({ delete: new Set(), disconnect: new Set() });
    setFailedIds([]);
    setHasRefreshError(false);
  };

  const beginGroupAction = ({
    operation,
    isRetry = false,
  }: {
    operation: 'delete' | 'disconnect';
    isRetry?: boolean;
  }) => {
    if (!isRetry || lastOperation !== operation) {
      resetGroupAction();
    }
    setLastOperation(operation);
  };

  const executeGroupAction = async ({
    accounts,
    operation,
  }: {
    accounts: ConsolidatedConnectedAccount[];
    operation: 'delete' | 'disconnect';
  }) => {
    const targets = accounts.filter(
      (account) =>
        canManageAccount(account) &&
        !completedIds[operation].has(account.id) &&
        (operation === 'delete' || !isDefined(account.archivedAt)),
    );

    setLoading(true);
    setFailedIds([]);
    setHasRefreshError(false);

    const results = await Promise.allSettled(
      targets.map((account) =>
        operation === 'delete'
          ? deleteAccount({ variables: { id: account.id } })
          : disconnectAccount({ variables: { id: account.id } }),
      ),
    );
    const successfulIds = new Set(
      targets
        .filter((_, index) => results[index].status === 'fulfilled')
        .map((account) => account.id),
    );

    setCompletedIds((previous) => ({
      ...previous,
      [operation]: new Set([...previous[operation], ...successfulIds]),
    }));
    setFailedIds(
      targets
        .filter((_, index) => results[index].status === 'rejected')
        .map((account) => account.id),
    );
    const failedResult = results.find((result) => result.status === 'rejected');

    if (isDefined(failedResult)) {
      enqueueToast(getToastOptionsFromError({ error: failedResult.reason }));
    }

    if (operation === 'delete') {
      client.cache.modify({
        fields: {
          myConnectedAccounts: (
            references: readonly Reference[] = [],
            { readField },
          ) =>
            references.filter((reference) => {
              const id = readField<string>('id', reference);

              return !isDefined(id) || !successfulIds.has(id);
            }),
        },
      });
    } else {
      for (const account of targets.filter((target) =>
        successfulIds.has(target.id),
      )) {
        client.cache.modify({
          id: client.cache.identify(account),
          fields: { archivedAt: () => new Date().toISOString() },
        });
      }
    }

    try {
      await client.refetchQueries({
        include: 'active',
        onQueryUpdated: (query) => {
          if (
            query.queryName === 'MyConsolidatedConnectedAccounts' ||
            query.queryName === 'MyConnectedAccounts' ||
            ((query.queryName === 'MyMessageChannels' ||
              query.queryName === 'MyCalendarChannels') &&
              !isDefined(query.variables.connectedAccountId))
          ) {
            return query.refetch();
          }

          return false;
        },
      });
    } catch {
      setHasRefreshError(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    executeGroupAction,
    beginGroupAction,
    resetGroupAction,
    lastOperation,
    completedIds,
    failedIds,
    hasRefreshError,
    loading,
  };
};
