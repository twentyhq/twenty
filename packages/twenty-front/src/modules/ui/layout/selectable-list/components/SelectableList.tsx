import { type ReactNode, useCallback, useState } from 'react';

import { useSelectableListHotKeys } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListHotKeys';
import { useSyncSelectableListItems } from '@/ui/layout/selectable-list/hooks/internal/useSyncSelectableListItems';
import { SelectableListNativeItemRefsContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListNativeItemRefsContext';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { SelectableListContextProvider } from '@/ui/layout/selectable-list/states/contexts/SelectableListContext';

type SelectableListProps = {
  children: ReactNode;
  selectableItemIdArray?: string[];
  selectableItemIdMatrix?: string[][];
  onSelect?: (selected: string) => void;
  selectableListInstanceId: string;
  focusId: string;
  shouldPreselectFirstItem?: boolean;
};

export const SelectableList = ({
  children,
  selectableItemIdArray,
  selectableItemIdMatrix,
  selectableListInstanceId,
  onSelect,
  focusId,
  shouldPreselectFirstItem = true,
}: SelectableListProps) => {
  const [nativeItemRefs] = useState(() => new Map<string, HTMLElement>());

  const focusNativeItem = useCallback(
    (itemId: string) => {
      for (const nativeItem of nativeItemRefs.values()) {
        if (nativeItem !== document.activeElement) {
          continue;
        }

        nativeItemRefs.get(itemId)?.focus();
        break;
      }
    },
    [nativeItemRefs],
  );

  useSelectableListHotKeys({
    instanceId: selectableListInstanceId,
    focusId,
    onSelect,
    onNavigate: focusNativeItem,
  });

  useSyncSelectableListItems({
    selectableListInstanceId,
    selectableItemIdArray,
    selectableItemIdMatrix,
    shouldPreselectFirstItem,
  });

  return (
    <SelectableListComponentInstanceContext.Provider
      value={{
        instanceId: selectableListInstanceId,
      }}
    >
      <SelectableListNativeItemRefsContext.Provider value={nativeItemRefs}>
        <SelectableListContextProvider value={{ focusId }}>
          {children}
        </SelectableListContextProvider>
      </SelectableListNativeItemRefsContext.Provider>
    </SelectableListComponentInstanceContext.Provider>
  );
};
