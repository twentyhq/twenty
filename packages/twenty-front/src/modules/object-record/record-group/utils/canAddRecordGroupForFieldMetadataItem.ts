import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isDefined } from 'twenty-shared/utils';

export const canAddRecordGroupForFieldMetadataItem = (
  fieldMetadataItem?: FieldMetadataItem,
): fieldMetadataItem is FieldMetadataItem =>
  isDefined(fieldMetadataItem) &&
  isManyToOneRelationField(fieldMetadataItem) &&
  isDefined(fieldMetadataItem.relation?.targetObjectMetadata?.nameSingular);
