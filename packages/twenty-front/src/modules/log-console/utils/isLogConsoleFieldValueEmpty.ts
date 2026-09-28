import { FieldMetadataType } from 'twenty-shared/types';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import {
  normalizeTimelinePhonesDiffValue,
  type TimelinePhonesDiffValue,
} from '@/activities/timeline-activities/utils/normalizeTimelinePhonesDiffValue';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';

export const isLogConsoleFieldValueEmpty = ({
  fieldMetadataItem,
  value,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type'>;
  value: unknown;
}) => {
  if (
    fieldMetadataItem.type === FieldMetadataType.PHONES &&
    isPlainObject(value)
  ) {
    const phones = normalizeTimelinePhonesDiffValue(
      value as TimelinePhonesDiffValue,
    );

    return (
      isFieldValueEmpty({
        fieldDefinition: fieldMetadataItem,
        fieldValue: phones,
      }) && !isNonEmptyArray(phones.additionalPhones)
    );
  }

  return isFieldValueEmpty({
    fieldDefinition: fieldMetadataItem,
    fieldValue: value,
  });
};
