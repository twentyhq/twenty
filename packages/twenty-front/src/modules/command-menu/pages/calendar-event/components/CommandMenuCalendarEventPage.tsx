import { CalendarEventDetails } from '@/activities/calendar/components/CalendarEventDetails';
import { CalendarEventDetailsEffect } from '@/activities/calendar/components/CalendarEventDetailsEffect';
import { FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE } from '@/activities/calendar/graphql/operation-signatures/FindOneCalendarEventOperationSignature';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const CommandMenuCalendarEventPage = () => {
  const { upsertRecords } = useUpsertRecordsInStore();
  const viewableRecordId = useRecoilComponentValue(
    viewableRecordIdComponentState,
  );

  const { record: calendarEvent } = useFindOneRecord<CalendarEvent>({
    objectNameSingular:
      FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE.objectNameSingular,
    objectRecordId: viewableRecordId ?? '',
    recordGqlFields: FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE.fields,
    // TODO: this is not executed on sub-sequent runs, make sure that it is intended
    onCompleted: (record) => {
      upsertRecords([record]);
    },
  });

  if (!calendarEvent) {
    return null;
  }

  return (
    <>
      <CalendarEventDetailsEffect record={calendarEvent} />
      <CalendarEventDetails calendarEvent={calendarEvent} />
    </>
  );
};
