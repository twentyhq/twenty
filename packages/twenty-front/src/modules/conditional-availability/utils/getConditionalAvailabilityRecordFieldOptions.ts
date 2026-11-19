import { CONDITIONAL_AVAILABILITY_DEFAULT_SUB_FIELD_BY_COMPOSITE_TYPE } from '@/conditional-availability/constants/ConditionalAvailabilityDefaultSubFieldByCompositeType';
import { type ConditionalAvailabilityRecordFieldOption } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldOption';
import { getConditionalAvailabilityRecordFieldSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubjects';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const getConditionalAvailabilityRecordFieldOptions = ({
  fields,
}: {
  fields: FieldMetadataItem[];
}): ConditionalAvailabilityRecordFieldOption[] =>
  fields
    .flatMap((field) => {
      const defaultSubFieldName = isCompositeFieldType(field.type)
        ? CONDITIONAL_AVAILABILITY_DEFAULT_SUB_FIELD_BY_COMPOSITE_TYPE[
            field.type
          ]
        : undefined;

      const subjects = getConditionalAvailabilityRecordFieldSubjects({
        field,
      }).toSorted(
        (firstSubject, secondSubject) =>
          Number(secondSubject.subFieldName === defaultSubFieldName) -
          Number(firstSubject.subFieldName === defaultSubFieldName),
      );

      return isNonEmptyArray(subjects) ? [{ field, subjects }] : [];
    })
    .toSorted((firstOption, secondOption) =>
      firstOption.field.label.localeCompare(secondOption.field.label),
    );
