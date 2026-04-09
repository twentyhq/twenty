import { useCallback } from 'react';
import { useStore } from 'jotai';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { commandMenuItemsDraftState } from '@/command-menu-item/server-items/edit/states/commandMenuItemsDraftState';
import { UPDATE_COMMAND_MENU_ITEM } from '@/command-menu-item/server-items/common/graphql/mutations/updateCommandMenuItem';
import { commandMenuItemsSelector } from '@/command-menu-item/server-items/common/states/commandMenuItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type UpdateCommandMenuItemInput } from '~/generated-metadata/graphql';

export const useSaveCommandMenuItemsDraft = () => {
  const store = useStore();
  const [updateCommandMenuItem] = useMutation(UPDATE_COMMAND_MENU_ITEM);
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);

  const saveCommandMenuItemsDraft = useCallback(async () => {
    const draft = store.get(commandMenuItemsDraftState.atom);

    if (!isDefined(draft)) {
      return;
    }

    const serverItemsById = new Map(
      commandMenuItems.map((item) => [item.id, item]),
    );

    const changedItems = draft.filter((draftItem) => {
      const serverItem = serverItemsById.get(draftItem.id);

      if (!isDefined(serverItem)) {
        return false;
      }

      return (
        draftItem.isPinned !== serverItem.isPinned ||
        draftItem.position !== serverItem.position ||
        draftItem.shortLabel !== serverItem.shortLabel
      );
    });

    await Promise.all(
      changedItems.map((item) => {
        const input: UpdateCommandMenuItemInput = {
          id: item.id,
          isPinned: item.isPinned,
          position: item.position,
          shortLabel: item.shortLabel,
        };

        return updateCommandMenuItem({ variables: { input } });
      }),
    );
  }, [store, commandMenuItems, updateCommandMenuItem]);

  return { saveCommandMenuItemsDraft };
};
