import { useContext } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { contextMenuIsOpenState } from '@/ui/navigation/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/navigation/context-menu/states/contextMenuPositionState';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

import { FieldContext } from '../../field/contexts/FieldContext';
import { isFieldRelation } from '../../field/types/guards/isFieldRelation';
import { ColumnContext } from '../contexts/ColumnContext';
import { ColumnIndexContext } from '../contexts/ColumnIndexContext';
import { RecordUpdateContext } from '../contexts/EntityUpdateMutationHookContext';
import { RowIdContext } from '../contexts/RowIdContext';
import { RecordTableCell } from '../record-table-cell/components/RecordTableCell';
import { useCurrentRowSelected } from '../record-table-row/hooks/useCurrentRowSelected';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

export const RecordTableCellContainer = ({
  cellIndex,
}: {
  cellIndex: number;
}) => {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);
  const currentRowId = useContext(RowIdContext);
  const { objectMetadataConfigScopeInjector } = getRecordTableScopeInjector();

  const { injectStateWithRecordTableScopeId } = useRecordTableScopedStates();

  const objectMetadataConfig = useRecoilValue(
    injectStateWithRecordTableScopeId(objectMetadataConfigScopeInjector),
  );

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

  const updateRecord = useContext(RecordUpdateContext);

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
              recoilScopeId: currentRowId + columnDefinition.label,
              entityId: currentRowId,
              fieldDefinition: columnDefinition,
              useUpdateRecord: () => [updateRecord, {}],
              hotkeyScope: customHotkeyScope,
              basePathToShowPage: objectMetadataConfig?.basePathToShowPage,
              isLabelIdentifier:
                columnDefinition.fieldMetadataId ===
                objectMetadataConfig?.labelIdentifierFieldMetadataId,
            }}
          >
            <RecordTableCell customHotkeyScope={{ scope: customHotkeyScope }} />
          </FieldContext.Provider>
        </td>
      </ColumnIndexContext.Provider>
    </RecoilScope>
  );
};
