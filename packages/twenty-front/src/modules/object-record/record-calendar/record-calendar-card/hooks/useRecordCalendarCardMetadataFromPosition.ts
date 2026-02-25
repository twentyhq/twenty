import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { recordCalendarCardEditModePositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardEditModePositionComponentState';
import { recordCalendarCardHoverPositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardHoverPositionComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordCalendarCardMetadataFromPosition = () => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const hoverPosition = useAtomComponentStateValue(
    recordCalendarCardHoverPositionComponentState,
  );

  const editModePosition = useAtomComponentStateValue(
    recordCalendarCardEditModePositionComponentState,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
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
