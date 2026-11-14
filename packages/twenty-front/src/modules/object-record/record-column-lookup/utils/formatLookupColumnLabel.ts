import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const formatLookupColumnLabel = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'label'>,
  lookupTargetFieldMetadataItem?: Pick<FieldMetadataItem, 'label'>,
) =>
  isDefined(lookupTargetFieldMetadataItem)
    ? `${fieldMetadataItem.label} › ${lookupTargetFieldMetadataItem.label}`
    : fieldMetadataItem.label;
