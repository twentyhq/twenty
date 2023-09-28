import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { ViewBar } from '@/ui/view-bar/components/ViewBar';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';

import { TableOptionsDropdownId } from '../../constants/TableOptionsDropdownId';
import { TableOptionsDropdown } from '../../options/components/TableOptionsDropdown';
import { TableRecoilScopeContext } from '../../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../../states/savedTableColumnsFamilyState';
import { tableColumnsScopedState } from '../../states/tableColumnsScopedState';
import { TableOptionsHotkeyScope } from '../../types/TableOptionsHotkeyScope';

export const TableHeader = () => {
  const { onCurrentViewSubmit, ...viewBarContextProps } =
    useContext(ViewBarContext);
  const tableRecoilScopeId = useRecoilScopeId(TableRecoilScopeContext);
  const [_, setSearchParams] = useSearchParams();

  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const savedTableColumns = await snapshot.getPromise(
          savedTableColumnsFamilyState(viewId),
        );
        set(tableColumnsScopedState(tableRecoilScopeId), savedTableColumns);
        setSearchParams({ view: viewId });
      },
    [tableRecoilScopeId, setSearchParams],
  );

  return (
    <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
      <ViewBarContext.Provider
        value={{
          ...viewBarContextProps,
          onCurrentViewSubmit,
          onViewSelect: handleViewSelect,
          onViewCreate: (view) => setSearchParams({ view: view.id }),
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
};
