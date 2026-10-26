import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const joinFullName = ({ firstName, lastName }: FieldFullNameValue) =>
  `${firstName} ${lastName}`.trim();
