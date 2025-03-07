import { CalendarEventDetails } from '@/activities/calendar/components/CalendarEventDetails';
import { CalendarEventDetailsEffect } from '@/activities/calendar/components/CalendarEventDetailsEffect';
import { FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE } from '@/activities/calendar/graphql/operation-signatures/FindOneCalendarEventOperationSignature';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const CommandMenuCalendarEventPage = () => {
  const { upsertRecords } = useUpsertRecordsInStore();
  const viewableRecordId = useRecoilComponentValueV2(
    viewableRecordIdComponentState,
  );

  const { record: calendarEvent } = useFindOneRecord<CalendarEvent>({
    objectNameSingular:
      FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE.objectNameSingular,
    objectRecordId: viewableRecordId ?? '',
    recordGqlFields: FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE.fields,
    onCompleted: (record) => upsertRecords([record]),
  });

  if (!calendarEvent) {
    return null;
  }

  return (
    <RecordFieldValueSelectorContextProvider>
      <CalendarEventDetailsEffect record={calendarEvent} />
      <RecordValueSetterEffect recordId={calendarEvent.id} />
      <CalendarEventDetails calendarEvent={calendarEvent} />
    </RecordFieldValueSelectorContextProvider>
  );
};
