import { useContext } from 'react';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';

import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';
import { contextMenuIsOpenState } from '@/ui/navigation/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/navigation/context-menu/states/contextMenuPositionState';

const StyledContainer = styled.td<{ isSelected: boolean }>`
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.accent.quaternary : theme.background.primary};
`;

export const RecordTableCellContainer = () => {
  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setCurrentRowSelected(true);
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setContextMenuOpenState(true);
  };

  const { objectMetadataItem } = useContext(RecordTableContext);
  const { columnDefinition } = useContext(RecordTableCellContext);
  const { recordId, pathToShowPage, isSelected } = useContext(
    RecordTableRowContext,
  );

  const updateRecord = useContext(RecordUpdateContext);

  if (!columnDefinition) {
    return null;
  }

  const customHotkeyScope = isFieldRelation(columnDefinition)
    ? RelationPickerHotkeyScope.RelationPicker
    : TableHotkeyScope.CellEditMode;

  return (
    <StyledContainer
      isSelected={isSelected}
      onContextMenu={(event) => handleContextMenu(event)}
    >
      <FieldContext.Provider
        value={{
          recoilScopeId: recordId + columnDefinition.label,
          entityId: recordId,
          fieldDefinition: columnDefinition,
          useUpdateRecord: () => [updateRecord, {}],
          hotkeyScope: customHotkeyScope,
          basePathToShowPage: pathToShowPage,
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
    </StyledContainer>
  );
};
