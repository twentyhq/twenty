import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useActionMenuEntries = () => {
  const setActionMenuEntries = useSetRecoilComponentStateV2(
    actionMenuEntriesComponentState,
  );

  const addActionMenuEntry = (entry: ActionMenuEntry) => {
    setActionMenuEntries(
      (prevEntries) => new Map([...prevEntries, [entry.key, entry]]),
    );
  };

  const removeActionMenuEntry = (key: string) => {
    setActionMenuEntries((prevEntries) => {
      const newMap = new Map(prevEntries);
      newMap.delete(key);
      return newMap;
    });
  };

  return {
    addActionMenuEntry,
    removeActionMenuEntry,
  };
};
