import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { recordBoardCardEditModePositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardEditModePositionComponentState';
import { recordBoardCardHoverPositionComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardHoverPositionComponentState';
import { recordBoardVisibleFieldDefinitionsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsComponentSelector';
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

  const visibleFieldDefinitions = useRecoilComponentValue(
    recordBoardVisibleFieldDefinitionsComponentSelector,
  );

  const visibleFieldDefinitionsFiltered = visibleFieldDefinitions.filter(
    (boardField) => !boardField.isLabelIdentifier,
  );

  const hoveredFieldDefinition = isDefined(hoverPosition)
    ? visibleFieldDefinitionsFiltered.at(hoverPosition)
    : undefined;

  const editedFieldDefinition = isDefined(editModePosition)
    ? visibleFieldDefinitionsFiltered.at(editModePosition)
    : undefined;

  const hoveredFieldMetadataItem = isDefined(hoveredFieldDefinition)
    ? objectMetadataItem.fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === hoveredFieldDefinition.fieldMetadataId,
      )
    : undefined;

  const editedFieldMetadataItem = isDefined(editedFieldDefinition)
    ? objectMetadataItem.fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === editedFieldDefinition.fieldMetadataId,
      )
    : undefined;

  return {
    hoveredFieldMetadataItem,
    editedFieldMetadataItem,
  };
};
