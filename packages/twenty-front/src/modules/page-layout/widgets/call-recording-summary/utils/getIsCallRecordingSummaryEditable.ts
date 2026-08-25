import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type GetIsCallRecordingSummaryEditableParams = {
  isCallRecordingReadOnly: boolean;
  callRecordingObjectPermissions: Pick<ObjectPermissions, 'restrictedFields'>;
  summaryFieldMetadataId: string | undefined;
};

export const getIsCallRecordingSummaryEditable = ({
  isCallRecordingReadOnly,
  callRecordingObjectPermissions,
  summaryFieldMetadataId,
}: GetIsCallRecordingSummaryEditableParams): boolean => {
  if (isCallRecordingReadOnly || !isDefined(summaryFieldMetadataId)) {
    return false;
  }

  return (
    callRecordingObjectPermissions.restrictedFields[summaryFieldMetadataId]
      ?.canUpdate !== false
  );
};
