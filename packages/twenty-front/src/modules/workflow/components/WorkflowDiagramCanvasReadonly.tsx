import { WorkflowDiagramCanvasBase } from '@/workflow/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeReadonly } from '@/workflow/components/WorkflowDiagramStepNodeReadonly';
import { WorkflowVersionStatusTag } from '@/workflow/components/WorkflowVersionStatusTag';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
import styled from '@emotion/styled';

const StyledStatusTagContainer = styled.div`
  left: 0;
  top: 0;
  position: absolute;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowDiagramCanvasReadonly = ({
  diagram,
  workflowVersion,
}: {
  diagram: WorkflowDiagram;
  workflowVersion: WorkflowVersion;
}) => {
  return (
    <WorkflowDiagramCanvasBase
      key={workflowVersion.id}
      diagram={diagram}
      nodeTypes={{
        default: WorkflowDiagramStepNodeReadonly,
        'empty-trigger': WorkflowDiagramEmptyTrigger,
      }}
    >
      <StyledStatusTagContainer>
        <WorkflowVersionStatusTag versionStatus={workflowVersion.status} />
      </StyledStatusTagContainer>
    </WorkflowDiagramCanvasBase>
  );
};
