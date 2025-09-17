import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const forceRegisteredActionsMapComponentState = createComponentState<
  Map<string, boolean | undefined>
>({
  key: 'forceRegisteredActionsMapComponentState',
  defaultValue: new Map(),
  componentInstanceContext: ActionMenuComponentInstanceContext,
});
