import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { type Field, type RelationType } from '~/generated-metadata/graphql';

export type FieldMetadataItemRelation = {
  type: RelationType;
  sourceFieldMetadata: Pick<Field, 'id' | 'name'>;
  targetFieldMetadata: Pick<Field, 'id' | 'name' | 'isCustom'>;
  sourceObjectMetadata: Pick<
    ObjectMetadataItem,
    'id' | 'nameSingular' | 'namePlural'
  >;
  targetObjectMetadata: Pick<
    ObjectMetadataItem,
    'id' | 'nameSingular' | 'namePlural'
  >;
};
