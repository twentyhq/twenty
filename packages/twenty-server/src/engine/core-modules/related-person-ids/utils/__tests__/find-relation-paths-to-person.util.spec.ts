import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { resolveRelationFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-relation-from-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findRelationPathsToPerson } from 'src/engine/core-modules/related-person-ids/utils/find-relation-paths-to-person.util';

jest.mock(
  'src/engine/metadata-modules/flat-field-metadata/utils/resolve-relation-from-flat-field-metadata.util',
);

const resolveRelationMock = jest.mocked(resolveRelationFromFlatFieldMetadata);

type RelationSpec = {
  fieldName: string;
  relationType: RelationType;
  targetObjectNameSingular: string;
  inverseFieldName: string;
};

const buildGraphFixtures = (graph: Record<string, RelationSpec[]>) => {
  const fieldId = (objectNameSingular: string, fieldName: string) =>
    `${objectNameSingular}.${fieldName}`;

  const flatObjectMetadataMaps = {
    byUniversalIdentifier: {},
    universalIdentifierById: {},
  } as unknown as FlatEntityMaps<FlatObjectMetadata>;

  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {},
    universalIdentifierById: {},
  } as unknown as FlatEntityMaps<FlatFieldMetadata>;

  const relationSpecByFieldId = new Map<
    string,
    { sourceObjectNameSingular: string; spec: RelationSpec }
  >();

  for (const [objectNameSingular, relationSpecs] of Object.entries(graph)) {
    flatObjectMetadataMaps.byUniversalIdentifier[objectNameSingular] = {
      id: objectNameSingular,
      nameSingular: objectNameSingular,
      fieldIds: relationSpecs.map((spec) =>
        fieldId(objectNameSingular, spec.fieldName),
      ),
    } as unknown as FlatObjectMetadata;
    flatObjectMetadataMaps.universalIdentifierById[objectNameSingular] =
      objectNameSingular;

    for (const spec of relationSpecs) {
      const id = fieldId(objectNameSingular, spec.fieldName);

      flatFieldMetadataMaps.byUniversalIdentifier[id] = {
        id,
        type: 'RELATION',
      } as unknown as FlatFieldMetadata;
      flatFieldMetadataMaps.universalIdentifierById[id] = id;

      relationSpecByFieldId.set(id, {
        sourceObjectNameSingular: objectNameSingular,
        spec,
      });
    }
  }

  resolveRelationMock.mockImplementation(({ sourceFlatFieldMetadata }) => {
    const resolved = relationSpecByFieldId.get(sourceFlatFieldMetadata.id);

    if (resolved === undefined) {
      return null;
    }

    const { sourceObjectNameSingular, spec } = resolved;

    return {
      type: spec.relationType,
      sourceObjectMetadata: {
        id: sourceObjectNameSingular,
        nameSingular: sourceObjectNameSingular,
      },
      targetObjectMetadata: {
        id: spec.targetObjectNameSingular,
        nameSingular: spec.targetObjectNameSingular,
      },
      sourceFieldMetadata: { name: spec.fieldName },
      targetFieldMetadata: { name: spec.inverseFieldName },
    } as ReturnType<typeof resolveRelationFromFlatFieldMetadata>;
  });

  return { flatObjectMetadataMaps, flatFieldMetadataMaps };
};

afterEach(() => {
  resolveRelationMock.mockReset();
});

describe('findRelationPathsToPerson', () => {
  it('returns the empty path for the person object itself', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({ person: [] });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'person',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([[]]);
  });

  it('resolves a direct relation to person, querying person by its foreign key', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({
        company: [
          {
            fieldName: 'people',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'person',
            inverseFieldName: 'company',
          },
        ],
        person: [
          {
            fieldName: 'company',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'company',
            inverseFieldName: 'people',
          },
        ],
      });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'company',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      [
        {
          direction: RelationType.ONE_TO_MANY,
          queryObjectNameSingular: 'person',
          joinColumnName: 'companyId',
        },
      ],
    ]);
  });

  it('resolves person through a two-hop join object', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({
        peopleList: [
          {
            fieldName: 'peopleListMemberships',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'peopleListMembership',
            inverseFieldName: 'peopleList',
          },
        ],
        peopleListMembership: [
          {
            fieldName: 'peopleList',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'peopleList',
            inverseFieldName: 'peopleListMemberships',
          },
          {
            fieldName: 'person',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'person',
            inverseFieldName: 'peopleListMemberships',
          },
        ],
        person: [
          {
            fieldName: 'peopleListMemberships',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'peopleListMembership',
            inverseFieldName: 'person',
          },
        ],
      });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'peopleList',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      [
        {
          direction: RelationType.ONE_TO_MANY,
          queryObjectNameSingular: 'peopleListMembership',
          joinColumnName: 'peopleListId',
        },
        {
          direction: RelationType.MANY_TO_ONE,
          queryObjectNameSingular: 'peopleListMembership',
          joinColumnName: 'personId',
        },
      ],
    ]);
  });

  it('collects both a direct and a longer relation chain to person (opportunity)', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({
        opportunity: [
          {
            fieldName: 'pointOfContact',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'person',
            inverseFieldName: 'pointOfContactForOpportunities',
          },
          {
            fieldName: 'company',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'company',
            inverseFieldName: 'opportunities',
          },
        ],
        company: [
          {
            fieldName: 'people',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'person',
            inverseFieldName: 'company',
          },
        ],
        person: [],
      });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'opportunity',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      [
        {
          direction: RelationType.MANY_TO_ONE,
          queryObjectNameSingular: 'opportunity',
          joinColumnName: 'pointOfContactId',
        },
      ],
      [
        {
          direction: RelationType.MANY_TO_ONE,
          queryObjectNameSingular: 'opportunity',
          joinColumnName: 'companyId',
        },
        {
          direction: RelationType.ONE_TO_MANY,
          queryObjectNameSingular: 'person',
          joinColumnName: 'companyId',
        },
      ],
    ]);
  });

  it('returns no path when person is unreachable, terminating on relation cycles', () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      buildGraphFixtures({
        rocket: [
          {
            fieldName: 'cells',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectNameSingular: 'rocketCell',
            inverseFieldName: 'rocket',
          },
        ],
        rocketCell: [
          {
            fieldName: 'rocket',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectNameSingular: 'rocket',
            inverseFieldName: 'cells',
          },
        ],
        person: [],
      });

    expect(
      findRelationPathsToPerson({
        rootObjectNameSingular: 'rocket',
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual([]);
  });
});
