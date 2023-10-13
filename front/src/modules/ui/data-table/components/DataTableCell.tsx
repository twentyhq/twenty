import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { contextMenuIsOpenState } from '@/ui/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/context-menu/states/contextMenuPositionState';
import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { isFieldRelation } from '@/ui/field/types/guards/isFieldRelation';
import { RelationPickerHotkeyScope } from '@/ui/input/relation-picker/types/RelationPickerHotkeyScope';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { ColumnContext } from '../contexts/ColumnContext';
import { ColumnIndexContext } from '../contexts/ColumnIndexContext';
import { EntityUpdateMutationContext } from '../contexts/EntityUpdateMutationHookContext';
import { RowIdContext } from '../contexts/RowIdContext';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { TableCell } from '../table-cell/components/TableCell';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

export const DataTableCell = ({ cellIndex }: { cellIndex: number }) => {
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

  // eslint-disable-next-line no-console
  console.log({ columnDefinition, currentRowId });

  if (!columnDefinition || !currentRowId) {
    return null;
  }

  const customHotkeyScope = isFieldRelation(columnDefinition)
    ? RelationPickerHotkeyScope.RelationPicker
    : TableHotkeyScope.CellEditMode;

  return (
    <RecoilScope>
      <ColumnIndexContext.Provider value={cellIndex}>
        <td onContextMenu={(event) => handleContextMenu(event)}>
          <FieldContext.Provider
            value={{
              recoilScopeId: currentRowId + columnDefinition.name,
              entityId: currentRowId,
              fieldDefinition: columnDefinition,
              useUpdateEntityMutation: () => [updateEntityMutation, {}],
              hotkeyScope: customHotkeyScope,
            }}
          >
            <TableCell customHotkeyScope={{ scope: customHotkeyScope }} />
          </FieldContext.Provider>
        </td>
      </ColumnIndexContext.Provider>
    </RecoilScope>
  );
};
