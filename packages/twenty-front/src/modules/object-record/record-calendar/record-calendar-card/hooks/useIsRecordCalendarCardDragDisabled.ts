import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { recordIndexCalendarEndFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarEndFieldMetadataIdState';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

export const useIsRecordCalendarCardDragDisabled = (recordId: string) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const recordIsReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: objectMetadataItem.id,
  });
  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  const recordIndexCalendarFieldMetadataId = useAtomStateValue(
    recordIndexCalendarFieldMetadataIdState,
  );
  const recordIndexCalendarEndFieldMetadataId = useAtomStateValue(
    recordIndexCalendarEndFieldMetadataIdState,
  );

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );
  const calendarEndFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarEndFieldMetadataId,
  );

  const calendarFieldIsReadOnly =
    calendarFieldMetadataItem?.isUIEditable === false ||
    (isDefined(calendarFieldMetadataItem) &&
      isFieldMetadataReadOnlyByPermissions({
        objectPermissions,
        fieldMetadataId: calendarFieldMetadataItem.id,
      }));
  const calendarEndFieldIsReadOnly =
    calendarEndFieldMetadataItem?.isUIEditable === false ||
    (isDefined(calendarEndFieldMetadataItem) &&
      isFieldMetadataReadOnlyByPermissions({
        objectPermissions,
        fieldMetadataId: calendarEndFieldMetadataItem.id,
      }));

  return (
    recordIsReadOnly || calendarFieldIsReadOnly || calendarEndFieldIsReadOnly
  );
};
