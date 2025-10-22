import { WorkflowVersionCard } from '@/workflow/workflow-diagram/components/WorkflowVersionCard';
import { type PageLayoutWidget } from '~/generated-metadata/graphql';

type WorkflowVersionWidgetProps = {
  widget: PageLayoutWidget;
};

export const WorkflowVersionWidget = ({
  widget: _widget,
}: WorkflowVersionWidgetProps) => {
  return <WorkflowVersionCard />;
};
