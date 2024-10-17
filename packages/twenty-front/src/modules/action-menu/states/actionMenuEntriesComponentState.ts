import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ActionMenuEntry } from '../types/ActionMenuEntry';

export const actionMenuEntriesComponentState = createComponentStateV2<
  Map<string, ActionMenuEntry>
>({
  key: 'actionMenuEntriesComponentState',
  defaultValue: new Map(),
  componentInstanceContext: ActionMenuComponentInstanceContext,
});
