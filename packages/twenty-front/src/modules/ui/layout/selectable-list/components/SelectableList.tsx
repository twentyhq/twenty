import { ReactNode, useEffect } from 'react';

import { useSelectableListHotKeys } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListHotKeys';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { SelectableListScope } from '@/ui/layout/selectable-list/scopes/SelectableListScope';
import { arrayToChunks } from '~/utils/array/arrayToChunks';
import { isDefined } from '~/utils/isDefined';

type SelectableListProps = {
  children: ReactNode;
  selectableListId: string;
  selectableItemIdArray?: string[];
  selectableItemIdMatrix?: string[][];
  onSelect?: (selected: string) => void;
  hotkeyScope: string;
  onEnter?: (itemId: string) => void;
};

export const SelectableList = ({
  children,
  selectableListId,
  hotkeyScope,
  selectableItemIdArray,
  selectableItemIdMatrix,
  onEnter,
}: SelectableListProps) => {
  useSelectableListHotKeys(selectableListId, hotkeyScope);

  const { setSelectableItemIds, setSelectableListOnEnter, setSelectedItemId } =
    useSelectableList(selectableListId);

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
  }, [
    selectableItemIdArray,
    selectableItemIdMatrix,
    setSelectableItemIds,
    setSelectedItemId,
  ]);

  return (
    <SelectableListScope selectableListScopeId={selectableListId}>
      {children}
    </SelectableListScope>
  );
};
