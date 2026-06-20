import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCloseRightClickMenu } from '@/workflow/workflow-diagram/hooks/useCloseRightClickMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { useWorkflowDiagramStickyNotes } from '@/workflow/workflow-diagram/hooks/useWorkflowDiagramStickyNotes';
import { useWorkflowDiagramScreenToFlowPosition } from '@/workflow/workflow-diagram/hooks/useWorkflowDiagramScreenToFlowPosition';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import { useTidyUp } from '@/workflow/workflow-version/hooks/useTidyUp';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconNotes, IconPlus, IconReorder } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';
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

  const { createStickyNote } = useWorkflowDiagramStickyNotes();

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

  const addStickyNote = async () => {
    const position = workflowDiagramScreenToFlowPosition(
      workflowDiagramRightClickMenuPosition,
    );

    if (isDefined(position)) {
      await createStickyNote(position);
    }

    closeRightClickMenu();
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
          text={t`Add note`}
          LeftIcon={IconNotes}
          onClick={addStickyNote}
        />
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
