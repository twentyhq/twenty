import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { useCloseRightClickMenu } from '@/workflow/workflow-diagram/hooks/useCloseRightClickMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useWorkflowDiagramScreenToFlowPosition } from '@/workflow/workflow-diagram/hooks/useWorkflowDiagramScreenToFlowPosition';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconReorder } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { WorkflowDiagramRightClickCommandMenuClickOutsideEffect } from './WorkflowDiagramRightClickCommandMenuClickOutsideEffect';

const StyledContainer = styled.div<{ x: number; y: number }>`
  background: ${({ theme }) => theme.background.primary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  border-radius: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  left: ${({ x }) => `${x}px`};
  padding: ${({ theme }) => theme.spacing(1)};
  position: absolute;
  top: ${({ y }) => `${y}px`};
  width: 200px;
`;

export const WorkflowDiagramRightClickCommandMenu = () => {
  const { t } = useLingui();
  const rightClickCommandMenuRef = useRef<HTMLDivElement>(null);

  const { workflowDiagramScreenToFlowPosition } =
    useWorkflowDiagramScreenToFlowPosition();

  const { startNodeCreation } = useStartNodeCreation();

  const { closeRightClickMenu } = useCloseRightClickMenu();

  const workflowDiagramRightClickMenuPosition = useRecoilComponentValue(
    workflowDiagramRightClickMenuPositionState,
  );

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );

  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion({
    workflow: workflowWithCurrentVersion,
  });

  const handleReorderWorkflowDiagram = async () => {
    await tidyUpWorkflowVersion();
    closeRightClickMenu();
  };

  const addNode = () => {
    const position = workflowDiagramScreenToFlowPosition(
      workflowDiagramRightClickMenuPosition,
    );
    startNodeCreation({
      parentStepId: undefined,
      nextStepId: undefined,
      position,
    });
  };

  if (!isDefined(workflowDiagramRightClickMenuPosition)) {
    return;
  }

  return (
    <>
      <StyledContainer
        ref={rightClickCommandMenuRef}
        x={workflowDiagramRightClickMenuPosition.x}
        y={workflowDiagramRightClickMenuPosition.y}
      >
        <MenuItem text={t`Add node`} LeftIcon={IconPlus} onClick={addNode} />
        <MenuItem
          text={t`Tidy up workflow`}
          LeftIcon={IconReorder}
          onClick={handleReorderWorkflowDiagram}
        />
      </StyledContainer>
      <WorkflowDiagramRightClickCommandMenuClickOutsideEffect
        rightClickCommandMenuRef={rightClickCommandMenuRef}
      />
    </>
  );
};
