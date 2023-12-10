import { ReactNode, useEffect } from 'react';
import styled from '@emotion/styled';

import { useSelectableListHotKeys } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListHotKeys';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { SelectableListScope } from '@/ui/layout/selectable-list/scopes/SelectableListScope';

type SelectableListProps = {
  children: ReactNode;
  selectableListId: string;
  selectableItemIds: string[][];
  onSelect?: (selected: string) => void;
  hotkeyScope: string;
  onEnter?: (itemId: string) => void;
};

const StyledSelectableItemsContainer = styled.div`
  width: 100%;
`;

export const SelectableList = ({
  children,
  selectableListId,
  hotkeyScope,
  selectableItemIds,
  onEnter,
}: SelectableListProps) => {
  useSelectableListHotKeys(selectableListId, hotkeyScope);

  const { setSelectableItemIds, setSelectableListOnEnter } = useSelectableList({
    selectableListId,
  });

  useEffect(() => {
    setSelectableListOnEnter(() => onEnter);
  }, [onEnter, setSelectableListOnEnter]);

  useEffect(() => {
    setSelectableItemIds(selectableItemIds);
  }, [selectableItemIds, setSelectableItemIds]);

  return (
    <SelectableListScope selectableListScopeId={selectableListId}>
      <StyledSelectableItemsContainer>
        {children}
      </StyledSelectableItemsContainer>
    </SelectableListScope>
  );
};
