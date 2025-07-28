import styled from '@emotion/styled';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import { isDefined } from 'twenty-shared/utils';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRef } from 'react';
import { WorkflowDiagramRightClickCommandMenuClickOutsideEffect } from './WorkflowDiagramRightClickCommandMenuClickOutsideEffect';
import { IconPlus, IconReorder } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useLingui } from '@lingui/react/macro';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useTidyUp } from '@/workflow/workflow-version/hooks/useTidyUp';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useCloseRightClickMenu } from '@/workflow/workflow-diagram/hooks/useCloseRightClickMenu';

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

  const { startNodeCreation } = useStartNodeCreation();

  const { closeRightClickMenu } = useCloseRightClickMenu();

  const workflowDiagramRightClickMenuPosition = useRecoilComponentValueV2(
    workflowDiagramRightClickMenuPositionState,
  );

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );

  const { tidyUp } = useTidyUp({ workflow: workflowWithCurrentVersion });

  const handleReorderWorkflowDiagram = async () => {
    await tidyUp();
    closeRightClickMenu();
  };

  const addNode = () => {
    startNodeCreation({
      parentStepId: undefined,
      nextStepId: undefined,
      position: workflowDiagramRightClickMenuPosition,
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
