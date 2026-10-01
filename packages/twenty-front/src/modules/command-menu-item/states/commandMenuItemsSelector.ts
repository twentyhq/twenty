import { commandMenuItemsWithInactiveSelector } from '@/command-menu-item/states/commandMenuItemsWithInactiveSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const commandMenuItemsSelector = createAtomSelector<
  CommandMenuItemFieldsFragment[]
>({
  key: 'commandMenuItemsSelector',
  get: ({ get }) =>
    get(commandMenuItemsWithInactiveSelector).filter((item) => item.isActive),
});
