import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isFormulaFieldMetadata } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

// Moving a record to another group writes the field, which a formula cannot take
export const canGroupRecordsByFieldMetadataItem = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relation'> &
    Partial<Pick<FieldMetadataItem, 'settings'>>,
): boolean =>
  !isFormulaFieldMetadata(fieldMetadataItem) &&
  (fieldMetadataItem.type === FieldMetadataType.SELECT ||
    isManyToOneRelationField(fieldMetadataItem));
