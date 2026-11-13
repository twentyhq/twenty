import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/junction/hasJunctionConfig';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

// Junction relations list the junction records, which a scope on the target object cannot filter
export const isScopableRelationField = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relation' | 'settings'>,
) =>
  fieldMetadataItem.type === FieldMetadataType.RELATION &&
  fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY &&
  !hasJunctionConfig(fieldMetadataItem.settings);
