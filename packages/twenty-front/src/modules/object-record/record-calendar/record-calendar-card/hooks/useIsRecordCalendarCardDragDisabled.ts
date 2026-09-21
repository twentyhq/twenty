import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { isRecordCalendarReadOnlyComponentState } from '@/object-record/record-calendar/states/isRecordCalendarReadOnlyComponentState';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
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
  const isRecordCalendarReadOnly = useAtomComponentStateValue(
    isRecordCalendarReadOnlyComponentState,
  );

  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
  );

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );

  const calendarFieldIsReadOnly =
    calendarFieldMetadataItem?.isUIEditable === false ||
    (isDefined(calendarFieldMetadataItem) &&
      isFieldMetadataReadOnlyByPermissions({
        objectPermissions,
        fieldMetadataId: calendarFieldMetadataItem.id,
      }));

  return (
    isRecordCalendarReadOnly || recordIsReadOnly || calendarFieldIsReadOnly
  );
};
