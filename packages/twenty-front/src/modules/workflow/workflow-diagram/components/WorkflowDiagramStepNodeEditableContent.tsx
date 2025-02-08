import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeIcon';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { FloatingIconButton, IconTrash } from 'twenty-ui';

export const WorkflowDiagramStepNodeEditableContent = ({
  data,
  selected,
  variant,
  onDelete,
}: {
  data: WorkflowDiagramStepNodeData;
  variant: WorkflowDiagramNodeVariant;
  selected: boolean;
  onDelete: () => void;
}) => {
  return (
    <WorkflowDiagramStepNodeBase
      name={data.name}
      variant={variant}
      nodeType={data.nodeType}
      Icon={<WorkflowDiagramStepNodeIcon data={data} />}
      RightFloatingElement={
        selected ? (
          <FloatingIconButton
            size="medium"
            Icon={IconTrash}
            onClick={onDelete}
          />
        ) : undefined
      }
      isLeafNode={data.isLeafNode}
    />
  );
};
