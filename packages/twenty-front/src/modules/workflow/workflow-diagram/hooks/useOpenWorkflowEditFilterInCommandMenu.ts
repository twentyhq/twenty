import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useOpenWorkflowEditFilterInCommandMenu = () => {
  const { getIcon } = useIcons();

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowDiagram = useSetRecoilComponentStateV2(
    workflowDiagramComponentState,
  );

  const openWorkflowEditFilterInCommandMenu = ({
    stepId,
    stepName,
  }: {
    stepId: string;
    stepName: string;
  }) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      throw new Error(
        'Workflow ID must be configured for the edge when opening a filter in command menu',
      );
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
          selected: node.id === stepId,
        })),
      };
    });

    openWorkflowEditStepInCommandMenu(
      workflowVisualizerWorkflowId,
      stepName,
      getIcon(getActionIcon('FILTER')),
    );
  };

  return {
    openWorkflowEditFilterInCommandMenu,
  };
};
