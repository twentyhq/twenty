import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { FieldMetadataType } from 'twenty-shared/types';

// Lookups follow one hop only, matching the server rule
export const isLookupTargetCandidateField = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  fieldMetadataItem.isActive === true &&
  !isHiddenSystemField(fieldMetadataItem) &&
  fieldMetadataItem.type !== FieldMetadataType.RELATION &&
  fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION;
