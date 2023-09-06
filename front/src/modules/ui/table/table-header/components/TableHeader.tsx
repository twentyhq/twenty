import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { FilterDropdownButton } from '@/ui/filter-n-sort/components/FilterDropdownButton';
import SortAndFilterBar from '@/ui/filter-n-sort/components/SortAndFilterBar';
import { SortDropdownButton } from '@/ui/filter-n-sort/components/SortDropdownButton';
import { canPersistFiltersScopedSelector } from '@/ui/filter-n-sort/states/selectors/canPersistFiltersScopedSelector';
import { canPersistSortsScopedSelector } from '@/ui/filter-n-sort/states/selectors/canPersistSortsScopedSelector';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import { FiltersHotkeyScope } from '@/ui/filter-n-sort/types/FiltersHotkeyScope';
import { SelectedSortType, SortType } from '@/ui/filter-n-sort/types/interface';
import { TopBar } from '@/ui/top-bar/TopBar';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableOptionsDropdown } from '../../options/components/TableOptionsDropdown';
import { TableUpdateViewButtonGroup } from '../../options/components/TableUpdateViewButtonGroup';
import { TableViewsDropdownButton } from '../../options/components/TableViewsDropdownButton';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { canPersistTableColumnsScopedSelector } from '../../states/selectors/canPersistTableColumnsScopedSelector';
import {
  currentTableViewIdState,
  type TableView,
} from '../../states/tableViewsState';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';
import { TableViewsHotkeyScope } from '../../types/TableViewsHotkeyScope';

type OwnProps<SortField> = {
  viewName: string;
  availableSorts?: Array<SortType<SortField>>;
  onViewsChange?: (views: TableView[]) => void;
  onViewSubmit?: () => void;
  onImport?: () => void;
};

export function TableHeader<SortField>({
  viewName,
  availableSorts,
  onViewsChange,
  onViewSubmit,
  onImport,
}: OwnProps<SortField>) {
  const tableScopeId = useContextScopeId(TableRecoilScopeContext);

  const currentTableViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const [sorts, setSorts] = useRecoilScopedState<SelectedSortType<SortField>[]>(
    sortsScopedState,
    TableRecoilScopeContext,
  );
  const canPersistTableColumns = useRecoilValue(
    canPersistTableColumnsScopedSelector([tableScopeId, currentTableViewId]),
  );
  const canPersistFilters = useRecoilValue(
    canPersistFiltersScopedSelector([tableScopeId, currentTableViewId]),
  );

  const canPersistSorts = useRecoilValue(
    canPersistSortsScopedSelector([tableScopeId, currentTableViewId]),
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
    <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
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
            <TableOptionsDropdown
              onImport={onImport}
              onViewsChange={onViewsChange}
              customHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
            />
          </>
        }
        bottomComponent={
          <SortAndFilterBar
            canPersistView={
              canPersistTableColumns || canPersistFilters || canPersistSorts
            }
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
