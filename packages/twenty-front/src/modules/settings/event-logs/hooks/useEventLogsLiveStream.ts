import { print, type ExecutionResult } from 'graphql';
import { useEffect, useState } from 'react';

import { EVENT_LOGS_LIVE_SUBSCRIPTION } from '@/settings/event-logs/graphql/subscriptions/EventLogsLiveSubscription';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { captureException } from '@sentry/react';
import { isDefined } from 'twenty-shared/utils';

import {
  type EventLogRecord,
  type EventLogTable,
} from '~/generated-metadata/graphql';

type EventLogsLivePayload = {
  eventLogsLive: EventLogRecord[] | null;
};

// print() the static document once, not on every subscribe.
const EVENT_LOGS_LIVE_SUBSCRIPTION_QUERY = print(EVENT_LOGS_LIVE_SUBSCRIPTION);

export const useEventLogsLiveStream = ({
  table,
  enabled,
}: {
  table: EventLogTable;
  enabled: boolean;
}): EventLogRecord[] => {
  const sseClient = useAtomStateValue(sseClientState);
  const [liveRecords, setLiveRecords] = useState<EventLogRecord[]>([]);

  // Reset the buffer when the table changes.
  useEffect(() => {
    setLiveRecords([]);
  }, [table]);

  // Drop the buffer when the stream is disabled (paused or filtered) so stale
  // records can't stay prepended and inflate the displayed count.
  useEffect(() => {
    if (!enabled) {
      setLiveRecords([]);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isDefined(sseClient)) {
      return;
    }

    const dispose = sseClient.subscribe<EventLogsLivePayload>(
      {
        query: EVENT_LOGS_LIVE_SUBSCRIPTION_QUERY,
        variables: { table },
      },
      {
        next: (value: ExecutionResult<EventLogsLivePayload>) => {
          const incoming = value.data?.eventLogsLive;

          if (isDefined(incoming) && incoming.length > 0) {
            setLiveRecords((previous) => [...incoming, ...previous]);
          }
        },
        error: (error) => captureException(error),
        complete: () => {},
      },
    );

    return () => dispose();
  }, [enabled, sseClient, table]);

  return liveRecords;
};
