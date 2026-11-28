import { FieldMetadataType } from 'twenty-shared/types';

// null: the field value itself is the files value.
export const FILES_SUB_FIELD_NAME_BY_FIELD_TYPE: Partial<
  Record<FieldMetadataType, string | null>
> = {
  [FieldMetadataType.FILES]: null,
  [FieldMetadataType.RICH_TEXT]: 'files',
};
