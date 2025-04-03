import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const currentActionIdComponentState = createComponentStateV2({
  componentInstanceContext: ActionMenuComponentInstanceContext,
  key: 'currentActionIdComponentState',
  defaultValue: undefined,
});
