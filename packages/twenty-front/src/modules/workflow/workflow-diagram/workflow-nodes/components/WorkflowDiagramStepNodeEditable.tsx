import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { useResetWorkflowInsertStepIds } from '@/workflow/workflow-diagram/hooks/useResetWorkflowInsertStepIds';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WorkflowDiagramStepNodeEditableContent } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeEditableContent';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowDiagramStepNodeEditable = ({
  id,
  data,
}: {
  id: string;
  data: WorkflowDiagramStepNodeData;
}) => {
  const { getIcon } = useIcons();

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const [workflowSelectedNode, setWorkflowSelectedNode] = useAtomComponentState(
    workflowSelectedNodeComponentState,
  );

  const selected = workflowSelectedNode === id;

  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const { resetWorkflowInsertStepIds } = useResetWorkflowInsertStepIds();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetAtomState(
    commandMenuNavigationStackState,
  );

  const handleClick = () => {
    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    resetWorkflowInsertStepIds();

    setWorkflowSelectedNode(id);

    if (isDefined(workflowVisualizerWorkflowId)) {
      openWorkflowEditStepInCommandMenu(
        workflowVisualizerWorkflowId,
        data.name,
        getIcon(getWorkflowNodeIconKey(data)),
        id,
      );

      return;
    }
  };

  return (
    <WorkflowDiagramStepNodeEditableContent
      id={id}
      data={data}
      selected={selected}
      onClick={handleClick}
    />
  );
};
