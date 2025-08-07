import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { assertWorkflowWithCurrentVersionIsDefined } from '@/workflow/utils/assertWorkflowWithCurrentVersionIsDefined';
import { WorkflowDiagramStepNodeEditableContent } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeEditableContent';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowDiagramStepNodeEditable = ({
  id,
  data,
  selected,
}: {
  id: string;
  data: WorkflowDiagramStepNodeData;
  selected?: boolean;
}) => {
  const { getIcon } = useIcons();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVisualizerWorkflowId,
  );
  assertWorkflowWithCurrentVersionIsDefined(workflowWithCurrentVersion);

  const { deleteStep } = useDeleteStep({
    workflow: workflowWithCurrentVersion,
  });

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );

  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  return (
    <WorkflowDiagramStepNodeEditableContent
      id={id}
      data={data}
      variant="default"
      selected={selected ?? false}
      onClick={() => {
        if (!isInRightDrawer) {
          setCommandMenuNavigationStack([]);
        }

        setWorkflowSelectedNode(id);

        if (isDefined(workflowVisualizerWorkflowId)) {
          openWorkflowEditStepInCommandMenu(
            workflowVisualizerWorkflowId,
            data.name,
            getIcon(getWorkflowNodeIconKey(data)),
          );

          return;
        }
      }}
      onDelete={() => {
        deleteStep(id);
      }}
    />
  );
};
