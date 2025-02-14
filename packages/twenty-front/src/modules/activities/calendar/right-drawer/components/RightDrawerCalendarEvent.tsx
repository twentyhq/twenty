import { useRecoilValue } from 'recoil';

import { CalendarEventDetails } from '@/activities/calendar/components/CalendarEventDetails';
import { CalendarEventDetailsEffect } from '@/activities/calendar/components/CalendarEventDetailsEffect';
import { FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE } from '@/activities/calendar/graphql/operation-signatures/FindOneCalendarEventOperationSignature';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

export const RightDrawerCalendarEvent = () => {
  const { upsertRecords } = useUpsertRecordsInStore();
  const viewableRecordId = useRecoilValue(viewableRecordIdState);

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
