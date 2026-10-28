import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { WorkflowLogicFunctionTabId } from '@/workflow/workflow-steps/workflow-actions/code-action/types/WorkflowLogicFunctionTabId';
import { WORKFLOW_STEP_TEST_TAB_LIST_COMPONENT_ID_BY_STEP_TYPE } from '@/workflow/workflow-variables/constants/WorkflowStepTestTabListComponentIdByStepType';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

export const useOpenWorkflowStepTestTab = () => {
  const { getIcon } = useIcons();
  const { openWorkflowEditStepInSidePanel } = useSidePanelWorkflowNavigation();
  const { closeDropdown } = useCloseDropdown();

  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const setWorkflowSelectedNode = useSetAtomComponentState(
    workflowSelectedNodeComponentState,
  );
  const setWorkflowDiagram = useSetAtomComponentState(
    workflowDiagramComponentState,
  );
  const setSidePanelNavigationStack = useSetAtomState(
    sidePanelNavigationStackState,
  );

  const openWorkflowStepTestTab = (
    step: Pick<StepOutputSchemaV2, 'id' | 'name' | 'icon' | 'type'>,
  ) => {
    if (!isDefined(workflowVisualizerWorkflowId)) {
      throw new Error(doNotTranslate('Workflow ID must be configured'));
    }

    setWorkflowSelectedNode(step.id);

    setWorkflowDiagram((diagram) => {
      if (!isDefined(diagram)) {
        throw new Error(doNotTranslate('Workflow diagram must be defined'));
      }

      return {
        ...diagram,
        nodes: diagram.nodes.map((node) => ({
          ...node,
          selected: node.id === step.id,
        })),
      };
    });

    setSidePanelNavigationStack([]);

    const tabListComponentId =
      WORKFLOW_STEP_TEST_TAB_LIST_COMPONENT_ID_BY_STEP_TYPE[step.type];

    openWorkflowEditStepInSidePanel({
      workflowId: workflowVisualizerWorkflowId,
      title: step.name,
      icon: getIcon(step.icon),
      stepId: step.id,
      initialStepTab: isDefined(tabListComponentId)
        ? { tabListComponentId, tabId: WorkflowLogicFunctionTabId.TEST }
        : undefined,
    });

    closeDropdown();
  };

  return { openWorkflowStepTestTab };
};
