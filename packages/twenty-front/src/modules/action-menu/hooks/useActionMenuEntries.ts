import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';

export const useActionMenuEntries = () => {
  const actionMenuEntryState = useRecoilComponentCallbackStateV2(
    actionMenuEntriesComponentState,
  );

  const addActionMenuEntry = useRecoilCallback(
    ({ snapshot, set }) =>
      async (entryToAdd: ActionMenuEntry) => {
        const currentEntries = snapshot
          .getLoadable(actionMenuEntryState)
          .getValue();

        const newEntries = new Map([
          ...currentEntries,
          [entryToAdd.key, entryToAdd],
        ]);
        set(actionMenuEntryState, newEntries);
      },
    [actionMenuEntriesComponentState],
  );

  const removeActionMenuEntry = useRecoilCallback(
    ({ snapshot, set }) =>
      async (entryKeyToRemove: string) => {
        const currentEntries = snapshot
          .getLoadable(actionMenuEntryState)
          .getValue();

        if (!currentEntries.has(entryKeyToRemove)) {
          return;
        }
        const newEntries = new Map(currentEntries);
        newEntries.delete(entryKeyToRemove);
        set(actionMenuEntryState, newEntries);
      },
    [actionMenuEntriesComponentState],
  );

  return {
    addActionMenuEntry,
    removeActionMenuEntry,
  };
};
