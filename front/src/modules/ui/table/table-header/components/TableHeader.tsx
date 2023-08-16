import { useCallback } from 'react';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { FilterDropdownButton } from '@/ui/filter-n-sort/components/FilterDropdownButton';
import SortAndFilterBar from '@/ui/filter-n-sort/components/SortAndFilterBar';
import { SortDropdownButton } from '@/ui/filter-n-sort/components/SortDropdownButton';
import { sortScopedState } from '@/ui/filter-n-sort/states/sortScopedState';
import { FiltersHotkeyScope } from '@/ui/filter-n-sort/types/FiltersHotkeyScope';
import { SelectedSortType, SortType } from '@/ui/filter-n-sort/types/interface';
import { TableOptionsDropdownButton } from '@/ui/table/options/components/TableOptionsDropdownButton';
import { TopBar } from '@/ui/top-bar/TopBar';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { TableViewsDropdownButton } from '../../options/components/TableViewsDropdownButton';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import type { TableView } from '../../states/tableViewsState';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';
import { TableViewsHotkeyScope } from '../../types/TableViewsHotkeyScope';

type OwnProps<SortField> = {
  viewName: string;
  availableSorts?: Array<SortType<SortField>>;
  onColumnsChange?: (columns: ViewFieldDefinition<ViewFieldMetadata>[]) => void;
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortField>>) => void;
  onViewsChange?: (views: TableView[]) => void;
  onImport?: () => void;
};

export function TableHeader<SortField>({
  viewName,
  availableSorts,
  onColumnsChange,
  onSortsUpdate,
  onViewsChange,
  onImport,
}: OwnProps<SortField>) {
  const [sorts, setSorts] = useRecoilScopedState<SelectedSortType<SortField>[]>(
    sortScopedState,
    TableRecoilScopeContext,
  );
  const handleSortsUpdate = onSortsUpdate ?? setSorts;

  const sortSelect = useCallback(
    (newSort: SelectedSortType<SortField>) => {
      const newSorts = updateSortOrFilterByKey(sorts, newSort);
      handleSortsUpdate(newSorts);
    },
    [handleSortsUpdate, sorts],
  );

  const sortUnselect = useCallback(
    (sortKey: string) => {
      const newSorts = sorts.filter((sort) => sort.key !== sortKey);
      handleSortsUpdate(newSorts);
    },
    [handleSortsUpdate, sorts],
  );

  return (
    <TopBar
      leftComponent={
        <TableViewsDropdownButton
          defaultViewName={viewName}
          HotkeyScope={TableViewsHotkeyScope.Dropdown}
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
          onCancelClick={() => {
            handleSortsUpdate([]);
          }}
          hasFilterButton
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
