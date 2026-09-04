import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

export const SidePanelWorkflowRunStepContentComponentInstanceContext =
  createComponentInstanceContext({
    surfaceScope: 'shared',
    initialValue: {
      instanceId: '',
    },
  });
