import { ON_SUBSCRIPTION_MATCH } from '@/subscription/graphql/subscriptions/onSubscriptionMatch';
import { useSseClient } from '@/subscription/hooks/useSseClient.util';
import { subscriptionRegistryState } from '@/subscription/states/subscriptionRegistryState';
import { print } from 'graphql';
import { useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type SubscriptionMatches } from '~/generated/graphql';

export const SubscriptionProviderEffect = () => {
  const subscriptionRegistry = useRecoilValue(subscriptionRegistryState);

  const { sseClient } = useSseClient();

  const subscriptions = useMemo(() => {
    return Array.from(subscriptionRegistry.values()).map((entry) => ({
      id: entry.id,
      query: entry.query,
    }));
  }, [subscriptionRegistry]);

  useEffect(() => {
    if (!sseClient || subscriptions.length === 0) {
      return;
    }

    const unsubscribe = sseClient.subscribe(
      {
        query: print(ON_SUBSCRIPTION_MATCH),
        variables: { subscriptions },
      },
      {
        next: (value) => {
          const data = value.data as {
            onSubscriptionMatch: SubscriptionMatches;
          } | null;

          if (!data?.onSubscriptionMatch?.matches) {
            return;
          }

          for (const match of data.onSubscriptionMatch.matches) {
            for (const subscriptionId of match.subscriptionIds) {
              const entry = subscriptionRegistry.get(subscriptionId);

              if (!isDefined(entry)) {
                continue;
              }

              entry.onRefetch();
            }
          }
        },
        error: (error) => {
          // eslint-disable-next-line no-console
          console.error('Subscription error:', error);
        },
        complete: () => {},
      },
    );

    return () => {
      unsubscribe();
    };
  }, [sseClient, subscriptions, subscriptionRegistry]);

  return null;
};
