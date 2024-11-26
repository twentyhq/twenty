import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { Command } from '@/command-menu/types/Command';
import { computeCommandMenuCommands } from '@/command-menu/utils/computeCommandMenuCommands';
import { selector } from 'recoil';

export const commandMenuCommandsSelector = selector<Command[]>({
  key: 'commandMenuCommandsSelector',
  get: ({ get }) => {
    const actionMenuEntries = get(
      actionMenuEntriesComponentSelector.selectorFamily({
        instanceId: 'command-menu',
      }),
    );

    return computeCommandMenuCommands(actionMenuEntries);
  },
});
