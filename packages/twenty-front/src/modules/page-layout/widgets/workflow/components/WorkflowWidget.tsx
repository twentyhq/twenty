import { WorkflowCard } from '@/workflow/workflow-diagram/components/WorkflowCard';
import { type PageLayoutWidget } from '~/generated-metadata/graphql';

type WorkflowWidgetProps = {
  widget: PageLayoutWidget;
};

export const WorkflowWidget = ({ widget: _widget }: WorkflowWidgetProps) => {
  return <WorkflowCard />;
};
