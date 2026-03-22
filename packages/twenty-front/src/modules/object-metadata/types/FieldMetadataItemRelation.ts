import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

import { type Field, type RelationType } from '~/generated-metadata/graphql';

export type FieldMetadataItemRelation = {
  type: RelationType;
  sourceFieldMetadata: Pick<Field, 'id' | 'name'>;
  targetFieldMetadata: Pick<Field, 'id' | 'name' | 'isCustom'>;
  sourceObjectMetadata: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular' | 'namePlural'
  >;
  targetObjectMetadata: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'nameSingular' | 'namePlural'
  >;
};
