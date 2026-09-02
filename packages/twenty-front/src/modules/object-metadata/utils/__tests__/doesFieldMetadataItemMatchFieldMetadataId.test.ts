import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { doesFieldMetadataItemMatchFieldMetadataId } from '@/object-metadata/utils/doesFieldMetadataItemMatchFieldMetadataId';
import { RelationType } from '~/generated-metadata/graphql';

const createRelation = (
  sourceFieldMetadataId: string,
): FieldMetadataItemRelation => ({
  type: RelationType.MANY_TO_ONE,
  sourceFieldMetadata: {
    id: sourceFieldMetadataId,
    name: 'sourceField',
  },
  targetFieldMetadata: {
    id: 'target-field-id',
    name: 'targetField',
  },
  sourceObjectMetadata: {
    id: 'source-object-id',
    nameSingular: 'sourceObject',
    namePlural: 'sourceObjects',
  },
  targetObjectMetadata: {
    id: 'target-object-id',
    nameSingular: 'targetObject',
    namePlural: 'targetObjects',
  },
});

const fieldMetadataItem = {
  id: 'field-id',
  relation: createRelation('relation-source-field-id'),
  morphRelations: [createRelation('morph-member-field-id')],
} satisfies Pick<FieldMetadataItem, 'id' | 'relation' | 'morphRelations'>;

describe('doesFieldMetadataItemMatchFieldMetadataId', () => {
  it.each([
    ['its own ID', fieldMetadataItem, 'field-id', true],
    [
      'its relation source ID',
      fieldMetadataItem,
      'relation-source-field-id',
      true,
    ],
    ['a morph member ID', fieldMetadataItem, 'morph-member-field-id', true],
    ['an unknown ID', fieldMetadataItem, 'unknown-field-id', false],
    [
      'an unknown ID when relations are absent',
      { id: 'field-id', relation: null, morphRelations: null },
      'unknown-field-id',
      false,
    ],
  ])('returns whether the field matches %s', (_, field, id, expected) => {
    expect(
      doesFieldMetadataItemMatchFieldMetadataId({
        fieldMetadataItem: field,
        fieldMetadataId: id,
      }),
    ).toBe(expected);
  });
});
