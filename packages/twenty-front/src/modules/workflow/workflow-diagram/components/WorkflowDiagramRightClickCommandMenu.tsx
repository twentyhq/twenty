import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCloseRightClickMenu } from '@/workflow/workflow-diagram/hooks/useCloseRightClickMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useWorkflowDiagramScreenToFlowPosition } from '@/workflow/workflow-diagram/hooks/useWorkflowDiagramScreenToFlowPosition';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import { useTidyUp } from '@/workflow/workflow-version/hooks/useTidyUp';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconReorder } from 'twenty-ui/icon';
import { WorkflowDiagramRightClickCommandMenuClickOutsideEffect } from './WorkflowDiagramRightClickCommandMenuClickOutsideEffect';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{ x: number; y: number }>`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.spacing[2]};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
  left: ${({ x }) => `${x}px`};
  padding: ${themeCssVariables.spacing[1]};
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

  const workflowDiagramRightClickMenuPosition = useAtomComponentStateValue(
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
        <DropdownListItem
          startIcon={<IconPlus />}
          onClick={addNode}
        >{t`Add node`}</DropdownListItem>
        <DropdownListItem
          startIcon={<IconReorder />}
          onClick={handleReorderWorkflowDiagram}
        >{t`Tidy up workflow`}</DropdownListItem>
      </StyledContainer>
      <WorkflowDiagramRightClickCommandMenuClickOutsideEffect
        rightClickCommandMenuRef={rightClickCommandMenuRef}
      />
    </>
  );
};
