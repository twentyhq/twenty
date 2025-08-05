import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeIcon';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getNodeVariantFromStepRunStatus } from '@/workflow/workflow-diagram/utils/getNodeVariantFromStepRunStatus';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowDiagramStepNodeReadonly = ({
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
  const workflowVisualizerWorkflowVersionId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );

  const { openWorkflowViewStepInCommandMenu } = useWorkflowCommandMenu();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  return (
    <WorkflowDiagramStepNodeBase
      name={data.name}
      variant={getNodeVariantFromStepRunStatus(data.runStatus)}
      nodeType={data.nodeType}
      Icon={<WorkflowDiagramStepNodeIcon data={data} />}
      displayHandle={false}
      onClick={() => {
        if (
          !isDefined(workflowVisualizerWorkflowId) ||
          !isDefined(workflowVisualizerWorkflowVersionId)
        ) {
          throw new Error('Workflow ID and Version ID must be defined');
        }

        if (!isInRightDrawer) {
          setCommandMenuNavigationStack([]);
        }

        setWorkflowSelectedNode(id);

        openWorkflowViewStepInCommandMenu({
          workflowId: workflowVisualizerWorkflowId,
          workflowVersionId: workflowVisualizerWorkflowVersionId,
          title: data.name,
          icon: getIcon(getWorkflowNodeIconKey(data)),
        });
      }}
    />
  );
};
