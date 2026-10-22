import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isBoolean } from '@sniptt/guards';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getRecordFormBooleanFieldDefaultValue = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'defaultValue'>,
): boolean | undefined =>
  fieldMetadataItem.type === FieldMetadataType.BOOLEAN &&
  isBoolean(fieldMetadataItem.defaultValue)
    ? fieldMetadataItem.defaultValue
    : undefined;
