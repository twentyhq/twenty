import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';

export const isFieldActorValue = (
  fieldValue: unknown,
): fieldValue is FieldActorValue =>
  FieldActorValue.safeParse(fieldValue).success;
