import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

export const WorkflowVisualizerComponentInstanceContext =
  createComponentInstanceContext({
    surfaceScope: 'shared',
    initialValue: {
      instanceId: '',
    },
  });
