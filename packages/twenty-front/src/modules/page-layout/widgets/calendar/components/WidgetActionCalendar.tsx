import { WidgetActionCalendarEventCreate } from '@/page-layout/widgets/calendar/components/WidgetActionCalendarEventCreate';
import { WidgetActionCalendarLinkEvents } from '@/page-layout/widgets/calendar/components/WidgetActionCalendarLinkEvents';

export const WidgetActionCalendar = () => (
  <>
    <WidgetActionCalendarLinkEvents />
    <WidgetActionCalendarEventCreate />
  </>
);
