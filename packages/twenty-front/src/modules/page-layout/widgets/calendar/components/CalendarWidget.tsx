import { CalendarEventsCard } from '@/activities/calendar/components/CalendarEventsCard';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';
import { Suspense } from 'react';

type CalendarWidgetProps = {
  widget: PageLayoutWidget;
};

export const CalendarWidget = ({ widget: _widget }: CalendarWidgetProps) => (
  <WidgetContentShell>
    <Suspense fallback={<SkeletonLoader />}>
      <CalendarEventsCard />
    </Suspense>
  </WidgetContentShell>
);
