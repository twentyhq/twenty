import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';

export const isFilterOnActorSourceSubField = (
  subFieldName?: string | null | undefined,
) => {
  return subFieldName === ('source' satisfies keyof FieldActorValue);
};
