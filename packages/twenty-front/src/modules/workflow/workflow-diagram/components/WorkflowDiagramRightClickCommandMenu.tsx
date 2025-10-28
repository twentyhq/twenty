import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useCloseRightClickMenu } from '@/workflow/workflow-diagram/hooks/useCloseRightClickMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useWorkflowDiagramScreenToFlowPosition } from '@/workflow/workflow-diagram/hooks/useWorkflowDiagramScreenToFlowPosition';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import { useTidyUp } from '@/workflow/workflow-version/hooks/useTidyUp';
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

  const { tidyUp } = useTidyUp();

  const handleReorderWorkflowDiagram = async () => {
    await tidyUp();
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
