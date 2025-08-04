import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { WORKFLOW_DIAGRAM_RIGHT_CLICK_MENU_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramRightClickMenuClickOutsideId';
import { workflowDiagramRightClickMenuPositionState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuPositionState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';

export const WorkflowDiagramRightClickCommandMenuClickOutsideEffect = ({
  rightClickCommandMenuRef,
}: {
  rightClickCommandMenuRef: React.RefObject<HTMLDivElement>;
}) => {
  const setWorkflowDiagramRightClickMenuPosition = useSetRecoilComponentStateV2(
    workflowDiagramRightClickMenuPositionState,
  );

  useListenClickOutside({
    refs: [rightClickCommandMenuRef],
    excludedClickOutsideIds: [COMMAND_MENU_CLICK_OUTSIDE_ID],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      setWorkflowDiagramRightClickMenuPosition(undefined);
    },
    listenerId: WORKFLOW_DIAGRAM_RIGHT_CLICK_MENU_CLICK_OUTSIDE_ID,
  });

  return <></>;
};
