import { type ConditionalAvailabilityRecordFieldOption } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldOption';
import { getConditionalAvailabilityRecordFieldSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubjects';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const getConditionalAvailabilityRecordFieldOptions = ({
  fields,
}: {
  fields: FieldMetadataItem[];
}): ConditionalAvailabilityRecordFieldOption[] =>
  fields
    .flatMap((field) => {
      const subjects = getConditionalAvailabilityRecordFieldSubjects({ field });

      return isNonEmptyArray(subjects) ? [{ field, subjects }] : [];
    })
    .toSorted((firstOption, secondOption) =>
      firstOption.field.label.localeCompare(secondOption.field.label),
    );
