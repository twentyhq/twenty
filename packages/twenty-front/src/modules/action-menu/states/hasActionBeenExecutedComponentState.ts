import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const hasActionBeenExecutedComponentState =
  createComponentStateV2<boolean>({
    componentInstanceContext: ActionMenuComponentInstanceContext,
    key: 'hasActionBeenExecutedComponentState',
    defaultValue: false,
  });
