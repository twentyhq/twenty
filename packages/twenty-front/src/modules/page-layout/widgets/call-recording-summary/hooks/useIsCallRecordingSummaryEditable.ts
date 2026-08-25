import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { getIsCallRecordingSummaryEditable } from '@/page-layout/widgets/call-recording-summary/utils/getIsCallRecordingSummaryEditable';
import { CoreObjectNameSingular } from 'twenty-shared/types';

// Call recordings are a system object, which the generic field rules keep
// read-only in the UI; the summary is the one field this widget lets people
// rewrite, so editability comes from permissions alone.
export const useIsCallRecordingSummaryEditable = ({
  callRecordingId,
}: {
  callRecordingId: string;
}): boolean => {
  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const summaryFieldMetadataItem = callRecordingObjectMetadataItem.fields.find(
    (fieldMetadataItem) => fieldMetadataItem.name === 'summary',
  );

  const callRecordingObjectPermissions = useObjectPermissionsForObject(
    callRecordingObjectMetadataItem.id,
  );

  const isCallRecordingReadOnly = useIsRecordReadOnly({
    recordId: callRecordingId,
    objectMetadataId: callRecordingObjectMetadataItem.id,
  });

  return getIsCallRecordingSummaryEditable({
    isCallRecordingReadOnly,
    callRecordingObjectPermissions,
    summaryFieldMetadataId: summaryFieldMetadataItem?.id,
  });
};
