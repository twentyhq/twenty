import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export const isFilterOnActorSourceSubField = (
  subFieldName?: string | null | undefined,
) => {
  return subFieldName === ('source' satisfies keyof FieldActorValue);
};
