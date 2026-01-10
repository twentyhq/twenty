import { SseClientContext } from '@/sse-db-event/contexts/SseClientContext';
import { ON_EVENT_SUBSCRIPTION } from '@/sse-db-event/graphql/subscriptions/OnEventSubscription';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { dispatchObjectRecordEventsWithQueryIds } from '@/sse-db-event/utils/dispatchObjectRecordEventsWithQueryIds';
import { isNonEmptyString } from '@sniptt/guards';
import { type ExecutionResult, print } from 'graphql';
import { useContext, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { type EventSubscription } from '~/generated/graphql';

export const SSEProviderEffect = () => {
  const sseClient = useContext(SseClientContext);

  const [sseEventStreamId, setSseEventStreamId] = useRecoilState(
    sseEventStreamIdState,
  );

  useEffect(() => {
    if (!isDefined(sseClient)) {
      return;
    }

    if (!isNonEmptyString(sseEventStreamId)) {
      setSseEventStreamId(v4());
      return;
    }

    const unsubscribe = sseClient.subscribe(
      {
        query: print(ON_EVENT_SUBSCRIPTION),
        variables: {
          eventStreamId: sseEventStreamId,
        },
      },
      {
        next: (
          value: ExecutionResult<{ onEventSubscription: EventSubscription }>,
        ) => {
          const objectRecordEventsWithQueryIds =
            value?.data?.onEventSubscription?.eventWithQueryIdsList ?? [];

          dispatchObjectRecordEventsWithQueryIds(
            objectRecordEventsWithQueryIds,
          );
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
  }, [sseClient, sseEventStreamId, setSseEventStreamId]);

  return null;
};
