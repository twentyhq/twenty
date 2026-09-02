import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

export const WorkflowVisualizerComponentInstanceContext =
  createComponentInstanceContext<ComponentStateKey>({
    instanceId: '',
  });
