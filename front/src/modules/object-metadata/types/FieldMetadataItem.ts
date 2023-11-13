import { Field, Relation } from '~/generated-metadata/graphql';

export type FieldMetadataItem = Omit<
  Field,
  'fromRelationMetadata' | 'toRelationMetadata'
> & {
  fromRelationMetadata?: Pick<Relation, 'id' | 'relationType'> | null;
  toRelationMetadata?: Pick<Relation, 'id' | 'relationType'> | null;
};
