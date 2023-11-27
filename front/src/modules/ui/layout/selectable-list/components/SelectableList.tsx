import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { SelectableListInternalEffect } from '@/ui/layout/selectable-list/components/SelectableListInternalEffect';
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
  selectableItemIds,
}: SelectableListProps) => {
  return (
    <SelectableListScope selectableListScopeId={selectableListId}>
      <SelectableListInternalEffect />
      <StyledSelectableItemsContainer>
        {children}
      </StyledSelectableItemsContainer>
    </SelectableListScope>
  );
};
