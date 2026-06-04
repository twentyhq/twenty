import { print, type ExecutionResult } from 'graphql';
import { useEffect, useState } from 'react';

import { EVENT_LOGS_LIVE_SUBSCRIPTION } from '@/settings/event-logs/graphql/subscriptions/EventLogsLiveSubscription';
import { sseClientState } from '@/sse-db-event/states/sseClientState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

import {
  type EventLogRecord,
  type EventLogTable,
} from '~/generated-metadata/graphql';

type EventLogsLivePayload = {
  eventLogsLive: EventLogRecord[] | null;
};

// Tails the unified live event stream over the shared graphql-sse client. New
// records are prepended; the list resets each time the subscription (re)opens.
export const useEventLogsLiveStream = ({
  table,
  enabled,
}: {
  table: EventLogTable;
  enabled: boolean;
}): EventLogRecord[] => {
  const sseClient = useAtomStateValue(sseClientState);
  const [liveRecords, setLiveRecords] = useState<EventLogRecord[]>([]);

  // Reset the buffer only when the table changes; pausing/resuming keeps it.
  useEffect(() => {
    setLiveRecords([]);
  }, [table]);

  useEffect(() => {
    if (!enabled || !isDefined(sseClient)) {
      return;
    }

    const dispose = sseClient.subscribe<EventLogsLivePayload>(
      {
        query: print(EVENT_LOGS_LIVE_SUBSCRIPTION),
        variables: { table },
      },
      {
        next: (value: ExecutionResult<EventLogsLivePayload>) => {
          const incoming = value.data?.eventLogsLive;

          if (isDefined(incoming) && incoming.length > 0) {
            setLiveRecords((previous) => [...incoming, ...previous]);
          }
        },
        error: () => {
          // graphql-sse reconnects automatically
        },
        complete: () => {
          // stays open until disposed
        },
      },
    );

    return () => dispose();
  }, [enabled, sseClient, table]);

  return liveRecords;
};
