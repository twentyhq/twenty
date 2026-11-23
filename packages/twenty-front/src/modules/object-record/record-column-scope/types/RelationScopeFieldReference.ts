import { type ViewFieldRelationScopeSort } from 'twenty-shared/types';

export type RelationScopeFieldReference = Pick<
  ViewFieldRelationScopeSort,
  'fieldMetadataId' | 'relationTargetFieldMetadataId'
>;
