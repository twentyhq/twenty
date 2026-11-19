import { getConditionalAvailabilityOfferedSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityOfferedSubjects';
import { getConditionalAvailabilityRecordFieldOptions } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldOptions';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useMemo } from 'react';
import { type ConditionalAvailabilityMetadataName } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useConditionalAvailabilityFields = ({
  metadataName,
  objectMetadataItem,
}: {
  metadataName: ConditionalAvailabilityMetadataName;
  objectMetadataItem: EnrichedObjectMetadataItem | null;
}) => {
  const fields = useMemo(
    () =>
      objectMetadataItem?.readableFields.filter(
        (field) => field.isActive === true,
      ) ?? [],
    [objectMetadataItem],
  );

  const recordFieldOptions = useMemo(
    () =>
      isDefined(objectMetadataItem) &&
      getConditionalAvailabilityOfferedSubjects({ metadataName }).recordField
        ? getConditionalAvailabilityRecordFieldOptions({ fields })
        : [],
    [metadataName, objectMetadataItem, fields],
  );

  return {
    fields,
    recordFieldOptions,
    recordFieldSectionLabel: objectMetadataItem?.labelSingular ?? null,
  };
};
