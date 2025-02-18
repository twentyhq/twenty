import {
  FieldActorValue,
  FieldActorValueSchema,
} from '@/object-record/record-field/types/FieldMetadata';

export const isFieldActorValue = (
  fieldValue: unknown,
): fieldValue is FieldActorValue =>
  FieldActorValueSchema.safeParse(fieldValue).success;
