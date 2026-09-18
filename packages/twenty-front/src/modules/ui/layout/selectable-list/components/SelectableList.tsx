import { type ReactNode } from 'react';

import { useSelectableListHotKeys } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListHotKeys';
import { useSyncSelectableListItems } from '@/ui/layout/selectable-list/hooks/internal/useSyncSelectableListItems';
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
  useSelectableListHotKeys(selectableListInstanceId, focusId, onSelect);

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
      <SelectableListContextProvider value={{ focusId }}>
        {children}
      </SelectableListContextProvider>
    </SelectableListComponentInstanceContext.Provider>
  );
};
