import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { FloatingIconButton, IconTrash } from 'twenty-ui';

export const WorkflowDiagramStepNodeEditableContent = ({
  data,
  selected,
  onDelete,
}: {
  data: WorkflowDiagramStepNodeData;
  selected: boolean;
  onDelete: () => void;
}) => {
  return (
    <WorkflowDiagramStepNodeBase
      data={data}
      RightFloatingElement={
        selected ? (
          <FloatingIconButton
            size="medium"
            Icon={IconTrash}
            onClick={onDelete}
          />
        ) : undefined
      }
    />
  );
};
