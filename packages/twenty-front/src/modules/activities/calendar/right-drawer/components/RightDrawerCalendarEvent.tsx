import { useRecoilValue } from 'recoil';

import { CalendarEventDetails } from '@/activities/calendar/components/CalendarEventDetails';
import { viewableCalendarEventIdState } from '@/activities/calendar/states/viewableCalendarEventIdState';
import { CalendarEvent } from '@/activities/calendar/types/CalendarEvent';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

export const RightDrawerCalendarEvent = () => {
  const calendarEventId = useRecoilValue(viewableCalendarEventIdState());
  const { record: calendarEvent } = useFindOneRecord<CalendarEvent>({
    objectNameSingular: CoreObjectNameSingular.CalendarEvent,
    objectRecordId: calendarEventId ?? '',
  });

  if (!calendarEvent) return null;

  return <CalendarEventDetails calendarEvent={calendarEvent} />;
};
