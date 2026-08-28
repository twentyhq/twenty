import { TimelineCard } from '@/activities/timeline-activities/components/TimelineCard';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';
import { Suspense } from 'react';

type TimelineWidgetProps = {
  widget: PageLayoutWidget;
};

export const TimelineWidget = ({ widget: _widget }: TimelineWidgetProps) => (
  <WidgetContentShell>
    <Suspense fallback={<SkeletonLoader withSubSections />}>
      <TimelineCard />
    </Suspense>
  </WidgetContentShell>
);
