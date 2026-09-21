import { TasksCard } from '@/activities/tasks/components/TasksCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';

type TaskWidgetProps = {
  widget: PageLayoutWidget;
};

export const TaskWidget = ({ widget: _widget }: TaskWidgetProps) => (
  <WidgetContentShell>
    <TasksCard />
  </WidgetContentShell>
);
