import {
  FieldActorValueSchema,
  type FieldActorValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFieldActorValue = (
  fieldValue: unknown,
): fieldValue is FieldActorValue =>
  FieldActorValueSchema.safeParse(fieldValue).success;
