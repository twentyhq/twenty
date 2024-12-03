import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { isDefined } from 'twenty-ui';

export const actionMenuEntriesComponentSelector = createComponentSelectorV2<
  ActionMenuEntry[]
>({
  key: 'actionMenuEntriesComponentSelector',
  componentInstanceContext: ActionMenuComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) =>
      Array.from(
        get(
          actionMenuEntriesComponentState.atomFamily({ instanceId }),
        ).values(),
      )
        .filter(isDefined)
        .sort((a, b) => a.position - b.position),
});
