import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { useResetWorkflowInsertStepIds } from '@/workflow/workflow-diagram/hooks/useResetWorkflowInsertStepIds';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WorkflowDiagramStepNodeEditableContent } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeEditableContent';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
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

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  const [workflowSelectedNode, setWorkflowSelectedNode] =
    useRecoilComponentStateV2(workflowSelectedNodeComponentState);

  const selected = workflowSelectedNode === id;

  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const { resetWorkflowInsertStepIds } = useResetWorkflowInsertStepIds();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetRecoilStateV2(
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
