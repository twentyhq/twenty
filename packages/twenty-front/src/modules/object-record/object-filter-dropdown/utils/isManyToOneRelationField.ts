import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

// MANY_TO_ONE relations are the only relation type the GraphQL filter API
// supports traversing today, so they're also the only ones we expose for
// drill-down in the filter dropdown.
export const isManyToOneRelationField = (field: FieldMetadataItem): boolean =>
  field.type === FieldMetadataType.RELATION &&
  field.relation?.type === RelationType.MANY_TO_ONE;
