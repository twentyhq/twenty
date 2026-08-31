import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { isValidJunctionTargetField } from '@/object-record/record-field/ui/utils/junction/isValidJunctionTargetField';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const createRelation = ({
  sourceFieldMetadataId,
  type = RelationType.MANY_TO_ONE,
}: {
  sourceFieldMetadataId: string;
  type?: RelationType;
}): FieldMetadataItemRelation => ({
  type,
  sourceFieldMetadata: {
    id: sourceFieldMetadataId,
    name: sourceFieldMetadataId,
  },
  targetFieldMetadata: { id: 'target-field-id', name: 'targetField' },
  sourceObjectMetadata: {
    id: 'junction-object-id',
    nameSingular: 'junctionObject',
    namePlural: 'junctionObjects',
  },
  targetObjectMetadata: {
    id: 'target-object-id',
    nameSingular: 'targetObject',
    namePlural: 'targetObjects',
  },
});

const createField = (
  overrides: Partial<FieldMetadataItem>,
): FieldMetadataItem =>
  ({
    id: 'field-id',
    name: 'field',
    type: FieldMetadataType.RELATION,
    ...overrides,
  }) as FieldMetadataItem;

describe('isValidJunctionTargetField', () => {
  it('accepts a many-to-one relation', () => {
    const field = createField({
      relation: createRelation({ sourceFieldMetadataId: 'field-id' }),
    });

    expect(isValidJunctionTargetField({ fieldMetadataItem: field })).toBe(true);
  });

  it('rejects a one-to-many relation', () => {
    const field = createField({
      relation: createRelation({
        sourceFieldMetadataId: 'field-id',
        type: RelationType.ONE_TO_MANY,
      }),
    });

    expect(isValidJunctionTargetField({ fieldMetadataItem: field })).toBe(
      false,
    );
  });

  it('accepts a morph relation when every target is many-to-one', () => {
    const field = createField({
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        createRelation({ sourceFieldMetadataId: 'morph-field-a' }),
        createRelation({ sourceFieldMetadataId: 'morph-field-b' }),
      ],
    });

    expect(isValidJunctionTargetField({ fieldMetadataItem: field })).toBe(true);
  });

  it('rejects a one-to-many morph relation', () => {
    const field = createField({
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        createRelation({
          sourceFieldMetadataId: 'morph-field-a',
          type: RelationType.ONE_TO_MANY,
        }),
      ],
    });

    expect(isValidJunctionTargetField({ fieldMetadataItem: field })).toBe(
      false,
    );
  });

  it('rejects the source field itself', () => {
    const field = createField({
      relation: createRelation({ sourceFieldMetadataId: 'field-id' }),
    });

    expect(
      isValidJunctionTargetField({
        fieldMetadataItem: field,
        sourceFieldMetadataId: 'field-id',
      }),
    ).toBe(false);
  });

  it('rejects a morph group containing the source field', () => {
    const field = createField({
      type: FieldMetadataType.MORPH_RELATION,
      morphRelations: [
        createRelation({ sourceFieldMetadataId: 'morph-field-a' }),
        createRelation({ sourceFieldMetadataId: 'source-field-id' }),
      ],
    });

    expect(
      isValidJunctionTargetField({
        fieldMetadataItem: field,
        sourceFieldMetadataId: 'source-field-id',
      }),
    ).toBe(false);
  });
});
