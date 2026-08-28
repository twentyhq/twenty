import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';

type CalendarWidgetProps = {
  widget: PageLayoutWidget;
};

export const CalendarWidget = ({ widget: _widget }: CalendarWidgetProps) => (
  <WidgetContentShell>
    <CalendarEventsCard />
  </WidgetContentShell>
);
