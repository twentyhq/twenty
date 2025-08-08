import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useOpenWorkflowEditFilterInCommandMenu = () => {
  const { getIcon } = useIcons();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowDiagram = useSetRecoilComponentState(
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
