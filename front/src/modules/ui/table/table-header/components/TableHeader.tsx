import { useCallback } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ViewBar, ViewBarProps } from '@/ui/view-bar/components/ViewBar';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';

import { TableOptionsDropdown } from '../../options/components/TableOptionsDropdown';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../../states/savedTableColumnsFamilyState';
import { canPersistTableColumnsScopedFamilySelector } from '../../states/selectors/canPersistTableColumnsScopedFamilySelector';
import { tableColumnsScopedState } from '../../states/tableColumnsScopedState';
import { TableOptionsDropdownKey } from '../../types/TableOptionsDropdownKey';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

export type TableHeaderProps<SortField> = {
  onImport?: () => void;
} & Pick<
  ViewBarProps<SortField>,
  'availableSorts' | 'defaultViewName' | 'onViewSubmit'
>;

export function TableHeader<SortField>({
  onImport,
  onViewSubmit,
  defaultViewName,
  availableSorts,
}: TableHeaderProps<SortField>) {
  const tableScopeId = useContextScopeId(TableRecoilScopeContext);

  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    TableRecoilScopeContext,
  );
  const canPersistTableColumns = useRecoilValue(
    canPersistTableColumnsScopedFamilySelector([tableScopeId, currentViewId]),
  );
  const [tableColumns, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const [savedTableColumns, setSavedTableColumns] = useRecoilState(
    savedTableColumnsFamilyState(currentViewId),
  );

  function handleViewBarReset() {
    setTableColumns(savedTableColumns);
  }

  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const savedTableColumns = await snapshot.getPromise(
          savedTableColumnsFamilyState(viewId),
        );
        set(tableColumnsScopedState(tableScopeId), savedTableColumns);
      },
    [tableScopeId],
  );

  async function handleViewSubmit() {
    if (canPersistTableColumns) {
      setSavedTableColumns(tableColumns);
    }

    await onViewSubmit?.();
  }

  const OptionsDropdownButton = useCallback(
    () => (
      <TableOptionsDropdown
        onImport={onImport}
        customHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
      />
    ),
    [onImport],
  );

  return (
    <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
      <ViewBar
        availableSorts={availableSorts}
        defaultViewName={defaultViewName}
        canPersistViewFields={canPersistTableColumns}
        onReset={handleViewBarReset}
        onViewSelect={handleViewSelect}
        onViewSubmit={handleViewSubmit}
        OptionsDropdownButton={OptionsDropdownButton}
        optionsDropdownKey={TableOptionsDropdownKey}
        scopeContext={TableRecoilScopeContext}
      />
    </RecoilScope>
  );
}
