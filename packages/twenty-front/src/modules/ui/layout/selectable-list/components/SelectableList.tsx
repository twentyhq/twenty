import { type ReactNode, useEffect } from 'react';

import { useSelectableListHotKeys } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListHotKeys';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { SelectableListContextProvider } from '@/ui/layout/selectable-list/states/contexts/SelectableListContext';
import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isDefined } from 'twenty-shared/utils';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

type SelectableListProps = {
  children: ReactNode;
  selectableItemIdArray?: string[];
  selectableItemIdMatrix?: string[][];
  onSelect?: (selected: string) => void;
  selectableListInstanceId: string;
  focusId: string;
};

export const SelectableList = ({
  children,
  selectableItemIdArray,
  selectableItemIdMatrix,
  selectableListInstanceId,
  onSelect,
  focusId,
}: SelectableListProps) => {
  useSelectableListHotKeys(selectableListInstanceId, focusId, onSelect);

  const setSelectableItemIds = useSetRecoilComponentState(
    selectableItemIdsComponentState,
    selectableListInstanceId,
  );

  useEffect(() => {
    if (!selectableItemIdArray && !selectableItemIdMatrix) {
      throw new Error(
        'Either selectableItemIdArray or selectableItemIdsMatrix must be provided',
      );
    }

    if (isDefined(selectableItemIdMatrix)) {
      setSelectableItemIds(selectableItemIdMatrix);
    }

    if (isDefined(selectableItemIdArray)) {
      setSelectableItemIds(arrayToChunks(selectableItemIdArray, 1));
    }
  }, [selectableItemIdArray, selectableItemIdMatrix, setSelectableItemIds]);

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
