import { useSidePanelWorkflowNavigation } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation';

export const useWorkflowCommandMenu = () => {
  const {
    openWorkflowTriggerTypeInSidePanel,
    openWorkflowCreateStepInSidePanel,
    openWorkflowEditStepInSidePanel,
    openWorkflowEditStepTypeInSidePanel,
    openWorkflowViewStepInSidePanel,
    openWorkflowRunViewStepInSidePanel,
  } = useSidePanelWorkflowNavigation();

  return {
    openWorkflowTriggerTypeInCommandMenu: openWorkflowTriggerTypeInSidePanel,
    openWorkflowCreateStepInCommandMenu: openWorkflowCreateStepInSidePanel,
    openWorkflowEditStepInCommandMenu: openWorkflowEditStepInSidePanel,
    openWorkflowEditStepTypeInCommandMenu:
      openWorkflowEditStepTypeInSidePanel,
    openWorkflowViewStepInCommandMenu: openWorkflowViewStepInSidePanel,
    openWorkflowRunViewStepInCommandMenu: openWorkflowRunViewStepInSidePanel,
  };
};
