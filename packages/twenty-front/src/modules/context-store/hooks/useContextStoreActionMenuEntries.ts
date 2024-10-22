import { ActionMenuEntry } from '@/action-menu/types/ActionMenuEntry';
import { contextStoreActionMenuEntriesComponentState } from '@/context-store/states/contextStoreActionMenuEntriesComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useContextStoreActionMenuEntries = () => {
  const setActionMenuEntries = useSetRecoilComponentStateV2(
    contextStoreActionMenuEntriesComponentState,
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
