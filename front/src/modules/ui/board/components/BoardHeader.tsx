import { Context, ReactNode, useCallback, useState } from 'react';
import styled from '@emotion/styled';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { FilterDropdownButton } from '@/ui/filter-n-sort/components/FilterDropdownButton';
import SortAndFilterBar from '@/ui/filter-n-sort/components/SortAndFilterBar';
import { SortDropdownButton } from '@/ui/filter-n-sort/components/SortDropdownButton';
import { FiltersHotkeyScope } from '@/ui/filter-n-sort/types/FiltersHotkeyScope';
import { SelectedSortType, SortType } from '@/ui/filter-n-sort/types/interface';
import { TopBar } from '@/ui/top-bar/TopBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import type { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptionsHotkeyScope } from '../types/BoardOptionsHotkeyScope';

import { BoardOptionsDropdown } from './BoardOptionsDropdown';

type OwnProps<SortField> = {
  viewName: string;
  viewIcon?: ReactNode;
  availableSorts?: Array<SortType<SortField>>;
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
  context: Context<string | null>;
};

const StyledIcon = styled.div`
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(2)};

  & > svg {
    font-size: ${({ theme }) => theme.icon.size.sm};
  }
`;

export function BoardHeader<SortField>({
  viewName,
  viewIcon,
  availableSorts,
  onSortsUpdate,
  onStageAdd,
  context,
}: OwnProps<SortField>) {
  const [sorts, innerSetSorts] = useState<Array<SelectedSortType<SortField>>>(
    [],
  );

  const sortSelect = useCallback(
    (newSort: SelectedSortType<SortField>) => {
      const newSorts = updateSortOrFilterByKey(sorts, newSort);
      innerSetSorts(newSorts);
      onSortsUpdate && onSortsUpdate(newSorts);
    },
    [onSortsUpdate, sorts],
  );

  const sortUnselect = useCallback(
    (sortKey: string) => {
      const newSorts = sorts.filter((sort) => sort.key !== sortKey);
      innerSetSorts(newSorts);
      onSortsUpdate && onSortsUpdate(newSorts);
    },
    [onSortsUpdate, sorts],
  );

  return (
    <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
      <TopBar
        displayBottomBorder={false}
        leftComponent={
          <>
            <StyledIcon>{viewIcon}</StyledIcon>
            {viewName}
          </>
        }
        rightComponent={
          <>
            <FilterDropdownButton
              context={context}
              HotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            />
            <SortDropdownButton<SortField>
              context={context}
              isSortSelected={sorts.length > 0}
              availableSorts={availableSorts || []}
              onSortSelect={sortSelect}
              HotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            />
            <BoardOptionsDropdown
              customHotkeyScope={{ scope: BoardOptionsHotkeyScope.Dropdown }}
              onStageAdd={onStageAdd}
            />
          </>
        }
        bottomComponent={
          <SortAndFilterBar
            context={context}
            sorts={sorts}
            onRemoveSort={sortUnselect}
            onCancelClick={() => {
              innerSetSorts([]);
              onSortsUpdate?.([]);
            }}
          />
        }
      />
    </RecoilScope>
  );
}

function updateSortOrFilterByKey<SortOrFilter extends { key: string }>(
  sorts: Readonly<SortOrFilter[]>,
  newSort: SortOrFilter,
): SortOrFilter[] {
  const newSorts = [...sorts];
  const existingSortIndex = sorts.findIndex((sort) => sort.key === newSort.key);

  if (existingSortIndex !== -1) {
    newSorts[existingSortIndex] = newSort;
  } else {
    newSorts.push(newSort);
  }

  return newSorts;
}
