import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { isNonEmptyString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useCallRecordingWidgetRestriction = ({
  requiredFieldNames,
}: {
  requiredFieldNames: string[];
}): {
  restriction: WidgetAccessDenialInfo | undefined;
  isFieldRestricted: (fieldName: string) => boolean;
} => {
  const { objectMetadataItem: callRecordingObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.CallRecording,
    });

  const callRecordingObjectPermissions = useObjectPermissionsForObject(
    callRecordingObjectMetadataItem.id,
  );

  const isFieldMetadataItemRestricted = (fieldMetadataItem: { id: string }) =>
    callRecordingObjectPermissions.restrictedFields[fieldMetadataItem.id]
      ?.canRead === false;

  const isFieldRestricted = (fieldName: string) => {
    const fieldMetadataItem = callRecordingObjectMetadataItem.fields.find(
      (field) => field.name === fieldName,
    );

    return (
      isDefined(fieldMetadataItem) &&
      isFieldMetadataItemRestricted(fieldMetadataItem)
    );
  };

  if (!callRecordingObjectPermissions.canReadObjectRecords) {
    return {
      restriction: {
        type: 'object',
        objectName: callRecordingObjectMetadataItem.labelSingular,
      },
      isFieldRestricted,
    };
  }

  const restrictedFieldNames = requiredFieldNames.flatMap(
    (requiredFieldName) => {
      const fieldMetadataItem = callRecordingObjectMetadataItem.fields.find(
        (field) => field.name === requiredFieldName,
      );

      if (
        !isDefined(fieldMetadataItem) ||
        !isFieldMetadataItemRestricted(fieldMetadataItem)
      ) {
        return [];
      }

      return [
        isNonEmptyString(fieldMetadataItem.label)
          ? fieldMetadataItem.label
          : fieldMetadataItem.name,
      ];
    },
  );

  return {
    restriction:
      restrictedFieldNames.length > 0
        ? { type: 'field', fieldNames: restrictedFieldNames }
        : undefined,
    isFieldRestricted,
  };
};
