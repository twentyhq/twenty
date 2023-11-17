import { Field, Relation } from '~/generated-metadata/graphql';

export type FieldMetadataItem = Omit<
  Field,
  'fromRelationMetadata' | 'toRelationMetadata'
> & {
  fromRelationMetadata?:
    | (Pick<Relation, 'id' | 'toFieldMetadataId' | 'relationType'> & {
        toObjectMetadata: Pick<Relation['toObjectMetadata'], 'id'>;
      })
    | null;
  toRelationMetadata?:
    | (Pick<Relation, 'id' | 'fromFieldMetadataId' | 'relationType'> & {
        fromObjectMetadata: Pick<Relation['fromObjectMetadata'], 'id'>;
      })
    | null;
};
