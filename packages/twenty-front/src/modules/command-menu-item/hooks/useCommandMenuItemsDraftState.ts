import { isDefined } from 'twenty-shared/utils';

import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useCommandMenuItemsDraftState = () => {
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const commandMenuItemsDraft = useAtomStateValue(commandMenuItemsDraftState);

  const isDirty =
    isDefined(commandMenuItemsDraft) &&
    !isDeeplyEqual(
      commandMenuItemsDraft.map(
        ({ id, isPinned, position, shortLabel, conditionalDisplay }) => ({
          id,
          isPinned,
          position,
          shortLabel,
          conditionalDisplay: conditionalDisplay ?? null,
        }),
      ),
      commandMenuItems.map(
        ({ id, isPinned, position, shortLabel, conditionalDisplay }) => ({
          id,
          isPinned,
          position,
          shortLabel,
          conditionalDisplay: conditionalDisplay ?? null,
        }),
      ),
    );

  return {
    commandMenuItemsDraft,
    isDirty,
  };
};
