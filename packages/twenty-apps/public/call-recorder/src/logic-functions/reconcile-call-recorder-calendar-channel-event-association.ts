import {
  defineLogicFunction,
  type ObjectRecordBaseEvent,
} from 'twenty-sdk/define';
import { type DatabaseEventBatchPayload } from 'twenty-sdk/logic-function';

import { CALENDAR_CHANNEL_EVENT_ASSOCIATION_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/logic-functions/constants/batch-handler-timeout-seconds';
import { type CalendarChannelEventAssociationForDatabaseEvent } from 'src/logic-functions/types/calendar-channel-event-association-for-database-event.type';
import { type UpcomingCalendarEventsReconciliationResult } from 'src/logic-functions/types/upcoming-calendar-events-reconciliation-result.type';
import { getCalendarEventIdsFromDatabaseEvents } from 'src/logic-functions/domain/get-calendar-event-ids-from-database-events.util';
import { reconcileCallRecorderForUpcomingCalendarEventIds } from 'src/logic-functions/flows/reconcile-call-recorder-for-upcoming-calendar-event-ids.util';
import { createCoreApiClientRunningAsApplication } from 'src/logic-functions/utils/create-core-api-client-running-as-application.util';

export const reconcileCallRecorderCalendarChannelEventAssociationHandler =
  async (
    batch: Pick<
      DatabaseEventBatchPayload<
        ObjectRecordBaseEvent<CalendarChannelEventAssociationForDatabaseEvent>
      >,
      'events'
    >,
  ): Promise<UpcomingCalendarEventsReconciliationResult> =>
    reconcileCallRecorderForUpcomingCalendarEventIds({
      client: createCoreApiClientRunningAsApplication(),
      calendarEventIds: getCalendarEventIdsFromDatabaseEvents(batch.events),
    });

export default defineLogicFunction({
  universalIdentifier:
    CALENDAR_CHANNEL_EVENT_ASSOCIATION_RECONCILIATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-call-recorder-calendar-channel-event-association',
  description:
    'Reconciles app-managed Recall bot recording requests when a calendar event is linked to or unlinked from a calendar.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  handler: reconcileCallRecorderCalendarChannelEventAssociationHandler,
  databaseEventTriggerSettings: {
    eventName: 'calendarChannelEventAssociation.*',
    updatedFields: ['calendarChannelId', 'calendarEventId'],
    batchMode: true,
  },
});
