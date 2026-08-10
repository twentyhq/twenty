import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const SUMMARY_FIELD_NAME = 'summary';

export const useCallRecordingSummaryFieldAccess = (): {
  isSummaryFieldMetadataMissing: boolean;
  restrictedSummaryFieldLabel: string | undefined;
} => {
  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const callRecordingObjectPermissions = useObjectPermissionsForObject(
    callRecordingObjectMetadataItem.id,
  );

  const summaryFieldMetadataItem = callRecordingObjectMetadataItem.fields.find(
    (field) => field.name === SUMMARY_FIELD_NAME,
  );

  const restrictedSummaryFieldLabel =
    isDefined(summaryFieldMetadataItem) &&
    callRecordingObjectPermissions.restrictedFields[summaryFieldMetadataItem.id]
      ?.canRead === false
      ? isNonEmptyString(summaryFieldMetadataItem.label)
        ? summaryFieldMetadataItem.label
        : summaryFieldMetadataItem.name
      : undefined;

  return {
    isSummaryFieldMetadataMissing: !isDefined(summaryFieldMetadataItem),
    restrictedSummaryFieldLabel,
  };
};
