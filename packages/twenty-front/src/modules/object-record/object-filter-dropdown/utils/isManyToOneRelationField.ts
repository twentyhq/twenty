import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

// MANY_TO_ONE is the only relation type the backend can currently traverse in
// filters (ONE_TO_MANY would need EXISTS-subquery support), so it's also the
// only one we expose as a drill-down target in the filter dropdown.
export const isManyToOneRelationField = (field: FieldMetadataItem): boolean =>
  field.type === FieldMetadataType.RELATION &&
  field.relation?.type === RelationType.MANY_TO_ONE;
