import { RelationMetadataType } from '~/generated-metadata/graphql';

export type RelationType =
  | Exclude<RelationMetadataType, 'MANY_TO_MANY'>
  | 'MANY_TO_ONE';
