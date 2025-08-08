import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowRunIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowRunIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';

export const useOpenWorkflowRunFilterInCommandMenu = () => {
  const { getIcon } = useIcons();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowVisualizerWorkflowRunId = useRecoilComponentValue(
    workflowVisualizerWorkflowRunIdComponentState,
  );

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowDiagram = useSetRecoilComponentState(
    workflowDiagramComponentState,
  );

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const openWorkflowRunFilterInCommandMenu = ({
    stepId,
    stepName,
    stepExecutionStatus,
  }: {
    stepId: string;
    stepName: string;
    stepExecutionStatus: StepStatus;
  }) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      throw new Error('Workflow ID is required');
    }

    if (!isDefined(workflowVisualizerWorkflowRunId)) {
      throw new Error('Workflow run ID is required');
    }

    setWorkflowSelectedNode(stepId);

    setWorkflowDiagram((diagram) => {
      if (!isDefined(diagram)) {
        throw new Error('Workflow diagram must be defined');
      }

      return {
        ...diagram,
        nodes: diagram.nodes.map((node) => ({
          ...node,
          selected: false,
        })),
      };
    });

    openWorkflowRunViewStepInCommandMenu({
      workflowId: workflowVisualizerWorkflowId,
      workflowRunId: workflowVisualizerWorkflowRunId,
      title: stepName,
      icon: getIcon(getActionIcon('FILTER')),
      workflowSelectedNode: stepId,
      stepExecutionStatus,
    });
  };

  return {
    openWorkflowRunFilterInCommandMenu,
  };
};
