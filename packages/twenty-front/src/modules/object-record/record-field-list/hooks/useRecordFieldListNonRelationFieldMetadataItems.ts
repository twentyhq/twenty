import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { FieldMetadataType } from 'twenty-shared/types';

export const useRecordFieldListNonRelationFieldMetadataItems = (
  objectNameSingular: string,
) => {
  const { inlineFieldMetadataItems } = useFieldListFieldMetadataItems({
    objectNameSingular,
  });

  return inlineFieldMetadataItems.filter(
    ({ type }) =>
      type !== FieldMetadataType.RELATION &&
      type !== FieldMetadataType.MORPH_RELATION,
  );
};
