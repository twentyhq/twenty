import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { ColumnContext } from '@/object-record/record-table/contexts/ColumnContext';
import { ColumnIndexContext } from '@/object-record/record-table/contexts/ColumnIndexContext';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RowIdContext } from '@/object-record/record-table/contexts/RowIdContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { useCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useCurrentRowSelected';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { contextMenuIsOpenState } from '@/ui/navigation/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/navigation/context-menu/states/contextMenuPositionState';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';

export const RecordTableCellContainer = ({
  cellIndex,
}: {
  cellIndex: number;
}) => {
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

  const { basePathToShowPage, objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular:
      columnDefinition?.metadata.objectMetadataNameSingular || '',
  });

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
              basePathToShowPage,
              isLabelIdentifier: isLabelIdentifierField({
                fieldMetadataItem: {
                  id: columnDefinition.fieldMetadataId,
                  name: columnDefinition.metadata.fieldName,
                },
                objectMetadataItem,
              }),
            }}
          >
            <RecordTableCell customHotkeyScope={{ scope: customHotkeyScope }} />
          </FieldContext.Provider>
        </td>
      </ColumnIndexContext.Provider>
    </RecoilScope>
  );
};
