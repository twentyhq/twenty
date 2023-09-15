import { useContext } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { ViewBar } from '@/ui/view-bar/components/ViewBar';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';

import { TableOptionsDropdownId } from '../../constants/TableOptionsDropdownId';
import { TableOptionsDropdown } from '../../options/components/TableOptionsDropdown';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../../states/savedTableColumnsFamilyState';
import { canPersistTableColumnsScopedFamilySelector } from '../../states/selectors/canPersistTableColumnsScopedFamilySelector';
import { tableColumnsScopedState } from '../../states/tableColumnsScopedState';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

export function TableHeader() {
  const { onCurrentViewSubmit, ...viewBarContextProps } =
    useContext(ViewBarContext);
  const tableRecoilScopeId = useRecoilScopeId(TableRecoilScopeContext);

  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    TableRecoilScopeContext,
  );
  const canPersistTableColumns = useRecoilValue(
    canPersistTableColumnsScopedFamilySelector({
      recoilScopeId: tableRecoilScopeId,
      viewId: currentViewId,
    }),
  );
  const [tableColumns, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const [savedTableColumns, setSavedTableColumns] = useRecoilState(
    savedTableColumnsFamilyState(currentViewId),
  );

  const handleViewBarReset = () => setTableColumns(savedTableColumns);

  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const savedTableColumns = await snapshot.getPromise(
          savedTableColumnsFamilyState(viewId),
        );
        set(tableColumnsScopedState(tableRecoilScopeId), savedTableColumns);
      },
    [tableRecoilScopeId],
  );

  async function handleCurrentViewSubmit() {
    if (canPersistTableColumns) {
      setSavedTableColumns(tableColumns);
    }

    await onCurrentViewSubmit?.();
  }

  return (
    <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
      <ViewBarContext.Provider
        value={{
          ...viewBarContextProps,
          canPersistViewFields: canPersistTableColumns,
          onCurrentViewSubmit: handleCurrentViewSubmit,
          onViewBarReset: handleViewBarReset,
          onViewSelect: handleViewSelect,
        }}
      >
        <ViewBar
          optionsDropdownButton={
            <TableOptionsDropdown
              customHotkeyScope={{ scope: TableOptionsHotkeyScope.Dropdown }}
            />
          }
          optionsDropdownKey={TableOptionsDropdownId}
        />
      </ViewBarContext.Provider>
    </RecoilScope>
  );
}
