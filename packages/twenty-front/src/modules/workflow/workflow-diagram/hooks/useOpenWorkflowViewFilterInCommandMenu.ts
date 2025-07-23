import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useOpenWorkflowViewFilterInCommandMenu = () => {
  const { getIcon } = useIcons();

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowVisualizerWorkflowVersionId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowVersionIdComponentState,
  );
  const { openWorkflowViewStepInCommandMenu } = useWorkflowCommandMenu();

  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowDiagram = useSetRecoilComponentStateV2(
    workflowDiagramComponentState,
  );

  const openWorkflowViewFilterInCommandMenu = ({
    stepId,
    stepName,
  }: {
    stepId: string;
    stepName: string;
  }) => {
    if (!workflowVisualizerWorkflowId) {
      throw new Error('Workflow ID is required');
    }

    if (!workflowVisualizerWorkflowVersionId) {
      throw new Error('Workflow version ID is required');
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

    openWorkflowViewStepInCommandMenu({
      workflowId: workflowVisualizerWorkflowId,
      workflowVersionId: workflowVisualizerWorkflowVersionId,
      title: stepName,
      icon: getIcon(getActionIcon('FILTER')),
    });
  };

  return {
    openWorkflowViewFilterInCommandMenu,
  };
};
