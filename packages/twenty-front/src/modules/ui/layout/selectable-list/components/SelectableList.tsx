import { ReactNode, useEffect } from 'react';

import { useSelectableListHotKeys } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListHotKeys';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { selectableItemIdsComponentState } from '@/ui/layout/selectable-list/states/selectableItemIdsComponentState';
import { selectableListOnEnterComponentState } from '@/ui/layout/selectable-list/states/selectableListOnEnterComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';
import { arrayToChunks } from '~/utils/array/arrayToChunks';

type SelectableListProps = {
  children: ReactNode;
  selectableItemIdArray?: string[];
  selectableItemIdMatrix?: string[][];
  onSelect?: (selected: string) => void;
  hotkeyScope: string;
  onEnter?: (itemId: string) => void;
  selectableListInstanceId: string;
};

export const SelectableList = ({
  children,
  hotkeyScope,
  selectableItemIdArray,
  selectableItemIdMatrix,
  selectableListInstanceId,
  onEnter,
  onSelect,
}: SelectableListProps) => {
  useSelectableListHotKeys(selectableListInstanceId, hotkeyScope, onSelect);

  const setSelectableListOnEnter = useSetRecoilComponentStateV2(
    selectableListOnEnterComponentState,
    selectableListInstanceId,
  );

  const setSelectableItemIds = useSetRecoilComponentStateV2(
    selectableItemIdsComponentState,
    selectableListInstanceId,
  );

  useEffect(() => {
    setSelectableListOnEnter(() => onEnter);
  }, [onEnter, setSelectableListOnEnter]);

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
      {children}
    </SelectableListComponentInstanceContext.Provider>
  );
};
