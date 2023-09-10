import { useCallback } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ViewBar, type ViewBarProps } from '@/ui/view-bar/components/ViewBar';
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
  'availableSorts' | 'defaultViewName' | 'onViewsChange' | 'onViewSubmit'
>;

export function TableHeader<SortField>({
  onImport,
  onViewsChange,
  onViewSubmit,
  ...props
}: TableHeaderProps<SortField>) {
  const tableScopeId = useContextScopeId(TableRecoilScopeContext);

  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    TableRecoilScopeContext,
  );
  const canPersistTableColumns = useRecoilValue(
    canPersistTableColumnsScopedFamilySelector([tableScopeId, currentViewId]),
  );
  const tableColumns = useRecoilScopedValue(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const setSavedTableColumns = useSetRecoilState(
    savedTableColumnsFamilyState(currentViewId),
  );

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

  const handleViewSubmit = async () => {
    if (canPersistTableColumns) setSavedTableColumns(tableColumns);

    await onViewSubmit?.();
  };

  const OptionsDropdownButton = useCallback(
    () => (
      <TableOptionsDropdown
        onImport={onImport}
        onViewsChange={onViewsChange}
        customHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
      />
    ),
    [onImport, onViewsChange],
  );

  return (
    <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
      <ViewBar
        {...props}
        canPersistViewFields={canPersistTableColumns}
        onViewSelect={handleViewSelect}
        onViewSubmit={handleViewSubmit}
        OptionsDropdownButton={OptionsDropdownButton}
        optionsDropdownKey={TableOptionsDropdownKey}
        scopeContext={TableRecoilScopeContext}
      />
    </RecoilScope>
  );
}
