import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const canGroupRecordsByFieldMetadataItem = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relation'>,
): boolean =>
  fieldMetadataItem.type === FieldMetadataType.SELECT ||
  isManyToOneRelationField(fieldMetadataItem);
