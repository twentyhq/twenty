import { TasksCard } from '@/activities/tasks/components/TasksCard';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';
import { Suspense } from 'react';

type TaskWidgetProps = {
  widget: PageLayoutWidget;
};

export const TaskWidget = ({ widget: _widget }: TaskWidgetProps) => (
  <WidgetContentShell>
    <Suspense fallback={<SkeletonLoader />}>
      <TasksCard />
    </Suspense>
  </WidgetContentShell>
);
