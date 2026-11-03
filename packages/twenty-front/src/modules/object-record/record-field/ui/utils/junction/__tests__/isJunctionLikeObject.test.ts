import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { isJunctionLikeObject } from '@/object-record/record-field/ui/utils/junction/isJunctionLikeObject';
import { RelationType } from '~/generated-metadata/graphql';

const buildRelation = (type: RelationType): FieldMetadataItemRelation => ({
  type,
  sourceFieldMetadata: { id: 'source-field-id', name: 'source' },
  targetFieldMetadata: { id: 'target-field-id', name: 'target' },
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
});

const scalarField = {
  isSystem: false,
  isSystemSideEffect: false,
  relation: null,
  morphRelations: null,
};

const manyToOneField = {
  ...scalarField,
  relation: buildRelation(RelationType.MANY_TO_ONE),
};

const oneToManyField = {
  ...scalarField,
  relation: buildRelation(RelationType.ONE_TO_MANY),
};

describe('isJunctionLikeObject', () => {
  it('accepts an object whose relations are all many-to-one', () => {
    expect(
      isJunctionLikeObject([scalarField, manyToOneField, manyToOneField]),
    ).toBe(true);
  });

  it('rejects an object with a user-defined one-to-many relation', () => {
    expect(isJunctionLikeObject([manyToOneField, oneToManyField])).toBe(false);
  });

  it('rejects an object with a one-to-many morph relation', () => {
    expect(
      isJunctionLikeObject([
        manyToOneField,
        {
          ...scalarField,
          morphRelations: [
            buildRelation(RelationType.MANY_TO_ONE),
            buildRelation(RelationType.ONE_TO_MANY),
          ],
        },
      ]),
    ).toBe(false);
  });

  it('ignores the default one-to-many relations the engine adds to custom objects', () => {
    expect(
      isJunctionLikeObject([
        manyToOneField,
        manyToOneField,
        { ...oneToManyField, isSystemSideEffect: true },
      ]),
    ).toBe(true);
  });

  it('ignores system fields', () => {
    expect(
      isJunctionLikeObject([
        manyToOneField,
        { ...oneToManyField, isSystem: true },
      ]),
    ).toBe(true);
  });
});
