import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { WORKFLOW_DIAGRAM_RIGHT_CLICK_MENU_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramRightClickMenuClickOutsideId';
import { workflowDiagramRightClickMenuState } from '@/workflow/workflow-diagram/states/workflowDiagramRightClickMenuState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const WorkflowDiagramRightClickCommandMenuClickOutsideEffect = ({
  rightClickCommandMenuRef,
}: {
  rightClickCommandMenuRef: React.RefObject<HTMLDivElement>;
}) => {
  const setWorkflowDiagramRightClickMenu = useSetRecoilComponentStateV2(
    workflowDiagramRightClickMenuState,
  );

  useListenClickOutside({
    refs: [rightClickCommandMenuRef],
    callback: (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();

      setWorkflowDiagramRightClickMenu(undefined);
    },
    listenerId: WORKFLOW_DIAGRAM_RIGHT_CLICK_MENU_CLICK_OUTSIDE_ID,
  });

  return <></>;
};
