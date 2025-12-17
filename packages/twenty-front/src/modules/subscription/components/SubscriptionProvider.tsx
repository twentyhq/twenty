import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { SseClientContext } from '@/subscription/contexts/SseClientContext';
import { ON_REFETCH_SIGNAL } from '@/subscription/graphql/subscriptions/onRefetchSignal';
import { subscriptionRegistryState } from '@/subscription/states/subscriptionRegistryState';
import { createClient } from 'graphql-sse';
import { print } from 'graphql';
import { type ReactNode, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type SubscriptionProviderProps = {
  children: ReactNode;
};

export const SubscriptionProvider = ({
  children,
}: SubscriptionProviderProps) => {
  const tokenPair = getTokenPair();
  const registry = useRecoilValue(subscriptionRegistryState);

  const sseClient = useMemo(() => {
    const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

    if (!token) {
      return null;
    }

    return createClient({
      url: `${REACT_APP_SERVER_BASE_URL}/graphql`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [tokenPair?.accessOrWorkspaceAgnosticToken?.token]);

  const subscriptions = useMemo(() => {
    return Array.from(registry.values()).map((entry) => ({
      id: entry.id,
      query: entry.query,
    }));
  }, [registry]);

  useEffect(() => {
    if (!sseClient || subscriptions.length === 0) {
      return;
    }

    const unsubscribe = sseClient.subscribe(
      {
        query: print(ON_REFETCH_SIGNAL),
        variables: { subscriptions },
      },
      {
        next: (value) => {
          const data = value.data as {
            onRefetchSignal: { subscriptionIds: string[] };
          } | null;

          if (!data?.onRefetchSignal?.subscriptionIds) {
            return;
          }

          for (const subscriptionId of data.onRefetchSignal.subscriptionIds) {
            const entry = registry.get(subscriptionId);
            entry?.onRefetch();
          }
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Subscription error:', error);
        },
        complete: () => {
          // Connection closed
        },
      },
    );

    return () => {
      unsubscribe();
    };
  }, [sseClient, subscriptions, registry]);

  return (
    <SseClientContext.Provider value={sseClient}>
      {children}
    </SseClientContext.Provider>
  );
};

