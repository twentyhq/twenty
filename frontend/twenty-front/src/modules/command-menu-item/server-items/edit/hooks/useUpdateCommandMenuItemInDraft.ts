import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { commandMenuItemsDraftState } from '@/command-menu-item/server-items/edit/states/commandMenuItemsDraftState';
import { type CommandMenuItemEditableFields } from '@/command-menu-item/server-items/edit/types/CommandMenuItemEditableFields';

export const useUpdateCommandMenuItemInDraft = () => {
  const store = useStore();

  const updateCommandMenuItemInDraft = useCallback(
    (id: string, fields: Partial<CommandMenuItemEditableFields>) => {
      const draft = store.get(commandMenuItemsDraftState.atom);

      if (!isDefined(draft)) {
        return;
      }

      const updatedDraft = draft.map((item) =>
        item.id === id ? { ...item, ...fields } : item,
      );

      store.set(commandMenuItemsDraftState.atom, updatedDraft);
    },
    [store],
  );

  return { updateCommandMenuItemInDraft };
};
