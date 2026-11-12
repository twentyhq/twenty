import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const canDisplayRecordIndexTabsForFieldMetadataItem = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'isActive' | 'options'>,
) =>
  fieldMetadataItem.type === FieldMetadataType.SELECT &&
  fieldMetadataItem.isActive === true &&
  isNonEmptyArray(fieldMetadataItem.options);
