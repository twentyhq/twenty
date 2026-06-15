import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { RESET_COMMAND_MENU_ITEM } from '@/command-menu-item/graphql/mutations/resetCommandMenuItem';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import {
  type ResetCommandMenuItemMutation,
  type ResetCommandMenuItemMutationVariables,
} from '~/generated-metadata/graphql';

export const useResetCommandMenuItemToDefault = () => {
  const store = useStore();
  const [resetCommandMenuItem] = useMutation<
    ResetCommandMenuItemMutation,
    ResetCommandMenuItemMutationVariables
  >(RESET_COMMAND_MENU_ITEM);
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const resetCommandMenuItemToDefault = useCallback(
    async (id: string) => {
      const result = await resetCommandMenuItem({ variables: { id } });

      const resetItem = result.data?.resetCommandMenuItem;

      if (!isDefined(resetItem)) {
        return;
      }

      updateInDraft('commandMenuItems', [resetItem]);
      applyChanges();

      const draft = store.get(commandMenuItemsDraftState.atom);

      if (isDefined(draft)) {
        store.set(
          commandMenuItemsDraftState.atom,
          draft.map((item) =>
            item.id === id ? { ...item, ...resetItem } : item,
          ),
        );
      }
    },
    [resetCommandMenuItem, updateInDraft, applyChanges, store],
  );

  return { resetCommandMenuItemToDefault };
};
