import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const getFieldOptionValues = (
  field: Pick<FlatFieldMetadata, 'options'>,
): string[] => field.options?.map((option) => option.value) ?? [];
