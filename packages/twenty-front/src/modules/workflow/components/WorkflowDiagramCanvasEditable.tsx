import { WorkflowDiagramCanvasBase } from '@/workflow/components/WorkflowDiagramCanvasBase';
import { WorkflowDiagramCanvasEditableEffect } from '@/workflow/components/WorkflowDiagramCanvasEditableEffect';
import { WorkflowDiagramCreateStepNode } from '@/workflow/components/WorkflowDiagramCreateStepNode';
import { WorkflowDiagramEmptyTrigger } from '@/workflow/components/WorkflowDiagramEmptyTrigger';
import { WorkflowDiagramStepNodeEditable } from '@/workflow/components/WorkflowDiagramStepNodeEditable';
import { WorkflowVersionStatusTag } from '@/workflow/components/WorkflowVersionStatusTag';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { WorkflowDiagram } from '@/workflow/types/WorkflowDiagram';
import styled from '@emotion/styled';

const StyledStatusTagContainer = styled.div`
  left: 0;
  top: 0;
  position: absolute;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowDiagramCanvasEditable = ({
  diagram,
  workflowWithCurrentVersion,
}: {
  diagram: WorkflowDiagram;
  workflowWithCurrentVersion: WorkflowWithCurrentVersion;
}) => {
  return (
    <WorkflowDiagramCanvasBase
      key={workflowWithCurrentVersion.currentVersion.id}
      diagram={diagram}
      nodeTypes={{
        default: WorkflowDiagramStepNodeEditable,
        'create-step': WorkflowDiagramCreateStepNode,
        'empty-trigger': WorkflowDiagramEmptyTrigger,
      }}
    >
      <WorkflowDiagramCanvasEditableEffect />

      <StyledStatusTagContainer>
        <WorkflowVersionStatusTag
          versionStatus={workflowWithCurrentVersion.currentVersion.status}
        />
      </StyledStatusTagContainer>
    </WorkflowDiagramCanvasBase>
  );
};
