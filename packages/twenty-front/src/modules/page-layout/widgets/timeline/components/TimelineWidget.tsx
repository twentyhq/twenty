import { TimelineCard } from '@/activities/timeline-activities/components/TimelineCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';

type TimelineWidgetProps = {
  widget: PageLayoutWidget;
};

export const TimelineWidget = ({ widget: _widget }: TimelineWidgetProps) => (
  <WidgetContentShell>
    <TimelineCard />
  </WidgetContentShell>
);
