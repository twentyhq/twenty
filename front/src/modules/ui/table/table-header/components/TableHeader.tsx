import { useCallback } from 'react';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { FilterDropdownButton } from '@/ui/filter-n-sort/components/FilterDropdownButton';
import SortAndFilterBar from '@/ui/filter-n-sort/components/SortAndFilterBar';
import { SortDropdownButton } from '@/ui/filter-n-sort/components/SortDropdownButton';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import { FiltersHotkeyScope } from '@/ui/filter-n-sort/types/FiltersHotkeyScope';
import { SelectedSortType, SortType } from '@/ui/filter-n-sort/types/interface';
import { TableOptionsDropdownButton } from '@/ui/table/options/components/TableOptionsDropdownButton';
import { TopBar } from '@/ui/top-bar/TopBar';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { TableUpdateViewButtonGroup } from '../../options/components/TableUpdateViewButtonGroup';
import { TableViewsDropdownButton } from '../../options/components/TableViewsDropdownButton';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import type { TableView } from '../../states/tableViewsState';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';
import { TableViewsHotkeyScope } from '../../types/TableViewsHotkeyScope';

type OwnProps<SortField> = {
  viewName: string;
  availableSorts?: Array<SortType<SortField>>;
  onColumnsChange?: (columns: ViewFieldDefinition<ViewFieldMetadata>[]) => void;
  onViewsChange?: (views: TableView[]) => void;
  onViewSubmit?: () => void;
  onImport?: () => void;
};

export function TableHeader<SortField>({
  viewName,
  availableSorts,
  onColumnsChange,
  onViewsChange,
  onViewSubmit,
  onImport,
}: OwnProps<SortField>) {
  const [sorts, setSorts] = useRecoilScopedState<SelectedSortType<SortField>[]>(
    sortsScopedState,
    TableRecoilScopeContext,
  );

  const sortSelect = useCallback(
    (newSort: SelectedSortType<SortField>) => {
      const newSorts = updateSortOrFilterByKey(sorts, newSort);
      setSorts(newSorts);
    },
    [setSorts, sorts],
  );

  const sortUnselect = useCallback(
    (sortKey: string) => {
      const newSorts = sorts.filter((sort) => sort.key !== sortKey);
      setSorts(newSorts);
    },
    [setSorts, sorts],
  );

  return (
    <TopBar
      leftComponent={
        <TableViewsDropdownButton
          defaultViewName={viewName}
          onViewsChange={onViewsChange}
          HotkeyScope={TableViewsHotkeyScope.ListDropdown}
        />
      }
      displayBottomBorder={false}
      rightComponent={
        <>
          <FilterDropdownButton
            context={TableRecoilScopeContext}
            HotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            isPrimaryButton
          />
          <SortDropdownButton<SortField>
            context={TableRecoilScopeContext}
            isSortSelected={sorts.length > 0}
            availableSorts={availableSorts || []}
            onSortSelect={sortSelect}
            HotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            isPrimaryButton
          />
          <TableOptionsDropdownButton
            onImport={onImport}
            onColumnsChange={onColumnsChange}
            onViewsChange={onViewsChange}
            HotkeyScope={TableOptionsHotkeyScope.Dropdown}
          />
        </>
      }
      bottomComponent={
        <SortAndFilterBar
          context={TableRecoilScopeContext}
          sorts={sorts}
          onRemoveSort={sortUnselect}
          onCancelClick={() => setSorts([])}
          hasFilterButton
          rightComponent={
            <TableUpdateViewButtonGroup
              onViewSubmit={onViewSubmit}
              HotkeyScope={TableViewsHotkeyScope.CreateDropdown}
            />
          }
        />
      }
    />
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
