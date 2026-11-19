import { type ConditionalAvailabilityRecordFieldSubject } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldSubject';
import { getConditionalAvailabilityRecordFieldSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFieldSubjects';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getConditionalAvailabilityRecordFieldRowSubject = ({
  fields,
  fieldName,
  propertyPath,
}: {
  fields: FieldMetadataItem[];
  fieldName: string;
  propertyPath: string;
}): {
  field: FieldMetadataItem;
  subject: ConditionalAvailabilityRecordFieldSubject;
} | null => {
  const field = fields.find((candidate) => candidate.name === fieldName);

  if (!isDefined(field)) {
    return null;
  }

  const subject = getConditionalAvailabilityRecordFieldSubjects({
    field,
  }).find((candidate) => candidate.propertyPath === propertyPath);

  return isDefined(subject) ? { field, subject } : null;
};
