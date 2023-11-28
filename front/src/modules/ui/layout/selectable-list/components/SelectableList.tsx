import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { useSelectableListHotKeys } from '@/ui/layout/selectable-list/hooks/internal/useSelectableListHotKeys';
import { SelectableListScope } from '@/ui/layout/selectable-list/scopes/SelectableListScope';
type SelectableListProps = {
  children: ReactNode;
  selectableListId: string;
  selectableItemIds: string[];
  onSelect?: (selected: string) => void;
};

const StyledSelectableItemsContainer = styled.div`
  width: 100%;
`;

export const SelectableList = ({
  children,
  selectableListId,
}: SelectableListProps) => {
  useSelectableListHotKeys(selectableListId);

  return (
    <SelectableListScope selectableListScopeId={selectableListId}>
      <StyledSelectableItemsContainer>
        {children}
      </StyledSelectableItemsContainer>
    </SelectableListScope>
  );
};
