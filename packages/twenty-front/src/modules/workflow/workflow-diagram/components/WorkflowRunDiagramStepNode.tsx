import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramStepNodeBase } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBase';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeIcon';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowRunDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getNodeVariantFromStepRunStatus } from '@/workflow/workflow-diagram/utils/getNodeVariantFromStepRunStatus';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const WorkflowRunDiagramStepNode = ({
  id,
  data,
}: {
  id: string;
  data: WorkflowRunDiagramStepNodeData;
}) => {
  const { getIcon } = useIcons();

  const workflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowRunId = useWorkflowRunIdOrThrow();

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  return (
    <WorkflowDiagramStepNodeBase
      id={id}
      name={data.name}
      variant={getNodeVariantFromStepRunStatus(data.runStatus)}
      nodeType={data.nodeType}
      Icon={<WorkflowDiagramStepNodeIcon data={data} />}
      displayHandle={false}
      onClick={() => {
        if (!isDefined(workflowId)) {
          throw new Error('Workflow ID must be defined');
        }

        if (!isInRightDrawer) {
          setCommandMenuNavigationStack([]);
        }

        setWorkflowSelectedNode(id);

        openWorkflowRunViewStepInCommandMenu({
          workflowId,
          workflowRunId,
          title: data.name,
          icon: getIcon(getWorkflowNodeIconKey(data)),
          workflowSelectedNode: id,
          stepExecutionStatus: data.runStatus,
        });
      }}
    />
  );
};
