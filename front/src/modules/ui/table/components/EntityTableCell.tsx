import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { contextMenuIsOpenState } from '@/ui/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/context-menu/states/contextMenuPositionState';
import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { ColumnContext } from '../contexts/ColumnContext';
import { ColumnIndexContext } from '../contexts/ColumnIndexContext';
import { EntityUpdateMutationContext } from '../contexts/EntityUpdateMutationHookContext';
import { RowIdContext } from '../contexts/RowIdContext';
import { GenericTableCell } from '../editable-cell/components/GenericTableCell';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';

export const EntityTableCell = ({ cellIndex }: { cellIndex: number }) => {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);
  const currentRowId = useContext(RowIdContext);

  const { setCurrentRowSelected } = useCurrentRowSelected();

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setCurrentRowSelected(true);
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setContextMenuOpenState(true);
  };

  const columnDefinition = useContext(ColumnContext);

  const updateEntityMutation = useContext(EntityUpdateMutationContext);

  if (!columnDefinition || !currentRowId) {
    return null;
  }

  return (
    <RecoilScope>
      <ColumnIndexContext.Provider value={cellIndex}>
        <td onContextMenu={(event) => handleContextMenu(event)}>
          <FieldContext.Provider
            value={{
              recoilScopeId: currentRowId,
              entityId: currentRowId,
              fieldDefinition: columnDefinition,
              updateEntityMutation,
            }}
          >
            <GenericTableCell />
          </FieldContext.Provider>
        </td>
      </ColumnIndexContext.Provider>
    </RecoilScope>
  );
};
