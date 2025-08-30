import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordBoardCardEditModePositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardEditModePositionComponentState';
import { recordBoardCardHoverPositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardHoverPositionComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordBoardCardMetadataFromPosition = () => {
  const { objectMetadataItem } = useContext(RecordBoardContext);

  const hoverPosition = useRecoilComponentValue(
    recordBoardCardHoverPositionComponentState,
  );

  const editModePosition = useRecoilComponentValue(
    recordBoardCardEditModePositionComponentState,
  );

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const visibleRecordFieldsFiltered = visibleRecordFields.filter(
    (recordField) =>
      labelIdentifierFieldMetadataItem?.id !== recordField.fieldMetadataItemId,
  );

  const hoveredRecordField = isDefined(hoverPosition)
    ? visibleRecordFieldsFiltered.at(hoverPosition)
    : undefined;

  const editedRecordField = isDefined(editModePosition)
    ? visibleRecordFieldsFiltered.at(editModePosition)
    : undefined;

  const hoveredFieldMetadataItem = isDefined(hoveredRecordField)
    ? objectMetadataItem.fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === hoveredRecordField.fieldMetadataItemId,
      )
    : undefined;

  const editedFieldMetadataItem = isDefined(editedRecordField)
    ? objectMetadataItem.fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === editedRecordField.fieldMetadataItemId,
      )
    : undefined;

  return {
    hoveredFieldMetadataItem,
    editedFieldMetadataItem,
  };
};
