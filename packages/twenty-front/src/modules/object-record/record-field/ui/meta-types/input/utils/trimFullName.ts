import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const trimFullName = ({
  firstName,
  lastName,
}: FieldFullNameValue): FieldFullNameValue => ({
  firstName: firstName.trim(),
  lastName: lastName.trim(),
});
