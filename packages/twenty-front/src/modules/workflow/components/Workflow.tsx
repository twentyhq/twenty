import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { WorkflowDiagramCanvas } from '@/workflow/components/WorkflowDiagramCanvas';
import { WorkflowShowPageEffect } from '@/workflow/components/WorkflowShowPageEffect';
import { workflowDiagramState } from '@/workflow/states/workflowDiagramState';
import styled from '@emotion/styled';
import '@xyflow/react/dist/style.css';
import { useRecoilValue } from 'recoil';

const StyledFlowContainer = styled.div`
  height: 100%;
  width: 100%;

  /* Below we reset the default styling of Reactflow */
  .react-flow__node-input,
  .react-flow__node-default,
  .react-flow__node-output,
  .react-flow__node-group {
    padding: 0;
  }

  --xy-node-border-radius: none;
  --xy-node-border: none;
  --xy-node-background-color: none;
  --xy-node-boxshadow-hover: none;
  --xy-node-boxshadow-selected: none;
`;

export const Workflow = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const workflowId = targetableObject.id;

  const workflowDiagram = useRecoilValue(workflowDiagramState);

  return (
    <>
      <WorkflowShowPageEffect workflowId={workflowId} />

      <StyledFlowContainer>
        {workflowDiagram === undefined ? null : (
          <WorkflowDiagramCanvas diagram={workflowDiagram} />
        )}
      </StyledFlowContainer>
    </>
  );
};
