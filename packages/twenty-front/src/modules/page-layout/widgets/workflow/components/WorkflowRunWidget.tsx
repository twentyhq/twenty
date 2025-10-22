import { WorkflowRunCard } from '@/workflow/workflow-diagram/components/WorkflowRunCard';
import { type PageLayoutWidget } from '~/generated-metadata/graphql';

type WorkflowRunWidgetProps = {
  widget: PageLayoutWidget;
};

export const WorkflowRunWidget = ({
  widget: _widget,
}: WorkflowRunWidgetProps) => {
  return <WorkflowRunCard />;
};
