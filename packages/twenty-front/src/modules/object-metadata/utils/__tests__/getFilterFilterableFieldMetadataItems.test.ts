import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const createRelationField = (relationType: RelationType): FieldMetadataItem =>
  ({
    id: `relation-${relationType}`,
    name: 'relatedRecords',
    label: 'Related records',
    type: FieldMetadataType.RELATION,
    isActive: true,
    isSystem: false,
    relation: {
      type: relationType,
      sourceFieldMetadata: { id: 'source-field-id', name: 'relatedRecords' },
      targetFieldMetadata: { id: 'target-field-id', name: 'sourceRecord' },
      sourceObjectMetadata: {
        id: 'source-object-id',
        nameSingular: 'source',
        namePlural: 'sources',
      },
      targetObjectMetadata: {
        id: 'target-object-id',
        nameSingular: 'target',
        namePlural: 'targets',
      },
    },
  }) as FieldMetadataItem;

describe('getFilterFilterableFieldMetadataItems', () => {
  const isFilterable = getFilterFilterableFieldMetadataItems({
    isJsonFilterEnabled: false,
  });

  it.each([RelationType.MANY_TO_ONE, RelationType.ONE_TO_MANY])(
    'includes %s relation fields',
    (relationType) => {
      expect(isFilterable(createRelationField(relationType))).toBe(true);
    },
  );

  it('excludes relation fields with missing relation metadata', () => {
    expect(
      isFilterable({
        ...createRelationField(RelationType.ONE_TO_MANY),
        relation: null,
      }),
    ).toBe(false);
  });
});
