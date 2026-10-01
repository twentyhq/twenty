import { useCallback } from 'react';
import { useStore } from 'jotai';
import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { UPDATE_COMMAND_MENU_ITEM } from '@/command-menu-item/graphql/mutations/updateCommandMenuItem';
import { commandMenuItemsWithInactiveSelector } from '@/command-menu-item/states/commandMenuItemsWithInactiveSelector';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type UpdateCommandMenuItemInput,
  type UpdateCommandMenuItemMutation,
  type UpdateCommandMenuItemMutationVariables,
} from '~/generated-metadata/graphql';

export const useSaveCommandMenuItemsDraft = () => {
  const store = useStore();
  const [updateCommandMenuItem] = useMutation<
    UpdateCommandMenuItemMutation,
    UpdateCommandMenuItemMutationVariables
  >(UPDATE_COMMAND_MENU_ITEM);
  const commandMenuItemsWithInactive = useAtomStateValue(
    commandMenuItemsWithInactiveSelector,
  );
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const saveCommandMenuItemsDraft = useCallback(async () => {
    const draft = store.get(commandMenuItemsDraftState.atom);

    if (!isDefined(draft)) {
      return;
    }

    const serverItemsById = new Map(
      commandMenuItemsWithInactive.map((item) => [item.id, item]),
    );

    const changedItems = draft.filter((draftItem) => {
      const serverItem = serverItemsById.get(draftItem.id);

      if (!isDefined(serverItem)) {
        return false;
      }

      return (
        draftItem.isPinned !== serverItem.isPinned ||
        draftItem.isActive !== serverItem.isActive ||
        draftItem.position !== serverItem.position ||
        draftItem.shortLabel !== serverItem.shortLabel
      );
    });

    if (changedItems.length === 0) {
      return;
    }

    await Promise.all(
      changedItems.map((item) => {
        const input: UpdateCommandMenuItemInput = {
          id: item.id,
          isPinned: item.isPinned,
          isActive: item.isActive,
          position: item.position,
          shortLabel: item.shortLabel,
        };

        return updateCommandMenuItem({ variables: { input } });
      }),
    );

    updateInDraft('commandMenuItems', changedItems);
    applyChanges();
  }, [
    store,
    commandMenuItemsWithInactive,
    updateCommandMenuItem,
    updateInDraft,
    applyChanges,
  ]);

  return { saveCommandMenuItemsDraft };
};
