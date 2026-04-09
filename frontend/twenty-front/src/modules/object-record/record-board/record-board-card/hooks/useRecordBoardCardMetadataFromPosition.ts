import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordBoardCardEditModePositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardEditModePositionComponentState';
import { recordBoardCardHoverPositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardHoverPositionComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordBoardCardMetadataFromPosition = () => {
  const { objectMetadataItem } = useContext(RecordBoardContext);

  const recordBoardCardHoverPosition = useAtomComponentStateValue(
    recordBoardCardHoverPositionComponentState,
  );

  const recordBoardCardEditModePosition = useAtomComponentStateValue(
    recordBoardCardEditModePositionComponentState,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const { labelIdentifierFieldMetadataItem } = useRecordIndexContextOrThrow();

  const visibleRecordFieldsFiltered = visibleRecordFields.filter(
    (recordField) =>
      labelIdentifierFieldMetadataItem?.id !== recordField.fieldMetadataItemId,
  );

  const hoveredRecordField = isDefined(recordBoardCardHoverPosition)
    ? visibleRecordFieldsFiltered.at(recordBoardCardHoverPosition)
    : undefined;

  const editedRecordField = isDefined(recordBoardCardEditModePosition)
    ? visibleRecordFieldsFiltered.at(recordBoardCardEditModePosition)
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
