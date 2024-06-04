import { useRecoilValue } from 'recoil';

import { CalendarEventDetails } from '@/activities/calendar/components/CalendarEventDetails';
import { FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE } from '@/activities/calendar/graphql/operation-signatures/FindOneCalendarEventOperationSignature';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useSetRecordInStore } from '@/object-record/record-store/hooks/useSetRecordInStore';

export const RightDrawerCalendarEvent = () => {
  const { setRecords } = useSetRecordInStore();
  const viewableRecordId = useRecoilValue(viewableRecordIdState);
  const { record: calendarEvent } = useFindOneRecord<CalendarEvent>({
    objectNameSingular:
      FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE.objectNameSingular,
    objectRecordId: viewableRecordId ?? '',
    recordGqlFields: FIND_ONE_CALENDAR_EVENT_OPERATION_SIGNATURE.fields,
    onCompleted: (record) => setRecords([record]),
  });

  if (!calendarEvent) {
    return null;
  }

  return <CalendarEventDetails calendarEvent={calendarEvent} />;
};
