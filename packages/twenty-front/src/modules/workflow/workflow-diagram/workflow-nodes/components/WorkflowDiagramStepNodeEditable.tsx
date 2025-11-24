import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { useResetWorkflowInsertStepIds } from '@/workflow/workflow-diagram/hooks/useResetWorkflowInsertStepIds';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WorkflowDiagramStepNodeEditableContent } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeEditableContent';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
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

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const [workflowSelectedNode, setWorkflowSelectedNode] =
    useRecoilComponentState(workflowSelectedNodeComponentState);

  const selected = workflowSelectedNode === id;

  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const { resetWorkflowInsertStepIds } = useResetWorkflowInsertStepIds();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetRecoilState(
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
