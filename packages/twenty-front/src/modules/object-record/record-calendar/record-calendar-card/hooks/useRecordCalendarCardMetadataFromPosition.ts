import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { recordCalendarCardEditModePositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardEditModePositionComponentState';
import { recordCalendarCardHoverPositionComponentState } from '@/object-record/record-calendar/record-calendar-card/states/recordCalendarCardHoverPositionComponentState';
import { useRecordCardVisibleRecordFields } from '@/object-record/record-card/hooks/useRecordCardVisibleRecordFields';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useRecordCalendarCardMetadataFromPosition = () => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const recordCalendarCardHoverPosition = useAtomComponentStateValue(
    recordCalendarCardHoverPositionComponentState,
  );

  const recordCalendarCardEditModePosition = useAtomComponentStateValue(
    recordCalendarCardEditModePositionComponentState,
  );

  const visibleRecordFieldsFiltered = useRecordCardVisibleRecordFields();

  const hoveredRecordField = isDefined(recordCalendarCardHoverPosition)
    ? visibleRecordFieldsFiltered.at(recordCalendarCardHoverPosition)
    : undefined;

  const editedRecordField = isDefined(recordCalendarCardEditModePosition)
    ? visibleRecordFieldsFiltered.at(recordCalendarCardEditModePosition)
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
