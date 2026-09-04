import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

export const SidePanelPageComponentInstanceContext =
  createComponentInstanceContext({
    surfaceScope: 'shared',
    initialValue: {
      instanceId: '',
    },
  });
