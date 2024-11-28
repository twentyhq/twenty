import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { Command } from '@/command-menu/types/Command';
import { computeCommandMenuCommands } from '@/command-menu/utils/computeCommandMenuCommands';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const commandMenuCommandsComponentSelector = createComponentSelectorV2<
  Command[]
>({
  key: 'commandMenuCommandsComponentSelector',
  componentInstanceContext: ActionMenuComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const actionMenuEntries = get(
        actionMenuEntriesComponentSelector.selectorFamily({
          instanceId,
        }),
      );

      return computeCommandMenuCommands(actionMenuEntries);
    },
});
