import { Kind, parse } from 'graphql';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildCommonSelectedFields } from 'src/engine/api/graphql/direct-execution/utils/build-common-selected-fields.util';
import { type GraphqlFieldSelection } from 'src/engine/api/graphql/workspace-resolver-builder/types/graphql-field-selection.type';
import { computeSelectionKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/compute-selection-key.util';
import { getGraphqlFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-graphql-field-selections.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const COMPANY_ID = 'company-object-id';
const PERSON_ID = 'person-object-id';

const FIELDS = [
  getFlatFieldMetadataMock({
    id: 'company-id-field-id',
    universalIdentifier: 'company-id-field-id',
    objectMetadataId: COMPANY_ID,
    name: 'id',
    type: FieldMetadataType.UUID,
  }),
  getFlatFieldMetadataMock({
    id: 'company-name-field-id',
    universalIdentifier: 'company-name-field-id',
    objectMetadataId: COMPANY_ID,
    name: 'name',
    type: FieldMetadataType.TEXT,
  }),
  getFlatFieldMetadataMock({
    id: 'company-people-field-id',
    universalIdentifier: 'company-people-field-id',
    objectMetadataId: COMPANY_ID,
    name: 'people',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: PERSON_ID,
    relationTargetFieldMetadataId: 'person-company-field-id',
    settings: { relationType: RelationType.ONE_TO_MANY },
  }),
  getFlatFieldMetadataMock({
    id: 'person-id-field-id',
    universalIdentifier: 'person-id-field-id',
    objectMetadataId: PERSON_ID,
    name: 'id',
    type: FieldMetadataType.UUID,
  }),
  getFlatFieldMetadataMock({
    id: 'person-phones-field-id',
    universalIdentifier: 'person-phones-field-id',
    objectMetadataId: PERSON_ID,
    name: 'phones',
    type: FieldMetadataType.PHONES,
  }),
  getFlatFieldMetadataMock({
    id: 'person-company-field-id',
    universalIdentifier: 'person-company-field-id',
    objectMetadataId: PERSON_ID,
    name: 'company',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: COMPANY_ID,
    relationTargetFieldMetadataId: 'company-people-field-id',
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'companyId',
    },
  }),
];

const OBJECTS = [
  getFlatObjectMetadataMock({
    id: COMPANY_ID,
    universalIdentifier: COMPANY_ID,
    nameSingular: 'company',
    fieldIds: [
      'company-id-field-id',
      'company-name-field-id',
      'company-people-field-id',
    ],
  }),
  getFlatObjectMetadataMock({
    id: PERSON_ID,
    universalIdentifier: PERSON_ID,
    nameSingular: 'person',
    fieldIds: [
      'person-id-field-id',
      'person-phones-field-id',
      'person-company-field-id',
    ],
  }),
];

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
  universalIdentifierById: Object.fromEntries(
    OBJECTS.map(({ id }) => [id, id]),
  ),
  byUniversalIdentifier: Object.fromEntries(
    OBJECTS.map((object) => [object.id, object]),
  ),
  universalIdentifiersByApplicationId: {},
};

const flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata> = {
  universalIdentifierById: Object.fromEntries(FIELDS.map(({ id }) => [id, id])),
  byUniversalIdentifier: Object.fromEntries(
    FIELDS.map((field) => [field.id, field]),
  ),
  universalIdentifiersByApplicationId: {},
};

const [COMPANY, PERSON] = OBJECTS;

const getRootFieldSelections = (query: string): GraphqlFieldSelection[] => {
  const [operation] = parse(query).definitions;

  if (operation.kind !== Kind.OPERATION_DEFINITION) {
    throw new Error('Expected an operation');
  }

  const [rootField] = operation.selectionSet.selections;

  if (rootField.kind !== Kind.FIELD) {
    throw new Error('Expected a root field');
  }

  return getGraphqlFieldSelections({
    fieldNodes: [rootField],
    fragments: {},
    variableValues: {},
  });
};

const buildRecord = ({
  query,
  flatObjectMetadata,
}: {
  query: string;
  flatObjectMetadata: FlatObjectMetadata;
}) =>
  buildCommonSelectedFields({
    selectionKind: 'record',
    fieldSelections: getRootFieldSelections(query),
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

const buildConnection = ({
  query,
  flatObjectMetadata,
}: {
  query: string;
  flatObjectMetadata: FlatObjectMetadata;
}) =>
  buildCommonSelectedFields({
    selectionKind: 'connection',
    fieldSelections: getRootFieldSelections(query),
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('buildCommonSelectedFields for a record', () => {
  it('separates scalars, join columns and composites from a to-one relation', () => {
    expect(
      buildRecord({
        query: `query {
          person {
            id
            companyId
            phones { primaryPhoneNumber primaryPhoneCallingCode }
            company { id name }
          }
        }`,
        flatObjectMetadata: PERSON,
      }),
    ).toStrictEqual({
      fields: {
        id: true,
        companyId: true,
        phones: { primaryPhoneNumber: true, primaryPhoneCallingCode: true },
      },
      aggregates: [],
      relations: {
        company: {
          fieldName: 'company',
          selectedFields: {
            fields: { id: true, name: true },
            aggregates: [],
            relations: {},
          },
        },
      },
    });
  });

  it('builds one relation per distinct set of arguments, keyed by selection key', () => {
    const firstOneKey = computeSelectionKey({
      fieldName: 'people',
      arguments: { first: 1 },
    });
    const firstTwoKey = computeSelectionKey({
      fieldName: 'people',
      arguments: { first: 2 },
    });

    expect(
      buildRecord({
        query: `query {
          company {
            people(first: 1) { edges { node { id } } }
            others: people(first: 2) { edges { node { phones { primaryPhoneNumber } } } }
          }
        }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      fields: {},
      aggregates: [],
      relations: {
        [firstOneKey]: {
          fieldName: 'people',
          arguments: { first: 1 },
          selectedFields: {
            fields: { id: true },
            aggregates: [],
            relations: {},
          },
        },
        [firstTwoKey]: {
          fieldName: 'people',
          arguments: { first: 2 },
          selectedFields: {
            fields: { phones: { primaryPhoneNumber: true } },
            aggregates: [],
            relations: {},
          },
        },
      },
    });
  });

  it('merges the sub-selections of aliases sharing a relation and its arguments', () => {
    const firstOneKey = computeSelectionKey({
      fieldName: 'people',
      arguments: { first: 1 },
    });

    expect(
      buildRecord({
        query: `query {
          company {
            people(first: 1) { edges { node { id } } }
            others: people(first: 1) {
              totalCount
              edges { node { company { name } } }
            }
          }
        }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      fields: {},
      aggregates: [],
      relations: {
        [firstOneKey]: {
          fieldName: 'people',
          arguments: { first: 1 },
          selectedFields: {
            fields: { id: true },
            aggregates: ['totalCount'],
            relations: {
              company: {
                fieldName: 'company',
                selectedFields: {
                  fields: { name: true },
                  aggregates: [],
                  relations: {},
                },
              },
            },
          },
        },
      },
    });
  });

  it('selects only the aggregate of a to-many relation without edges', () => {
    expect(
      buildRecord({
        query: `query { company { people { totalCount } } }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      fields: {},
      aggregates: [],
      relations: {
        people: {
          fieldName: 'people',
          selectedFields: {
            fields: {},
            aggregates: ['totalCount'],
            relations: {},
          },
        },
      },
    });
  });

  it('keeps an unknown field with sub-selections as a field', () => {
    expect(
      buildRecord({
        query: `query { company { name unknown { first second } } }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      fields: { name: true, unknown: { first: true, second: true } },
      aggregates: [],
      relations: {},
    });
  });
});

describe('buildCommonSelectedFields for a connection', () => {
  it('takes aggregates from the names next to edges and fields from edges.node', () => {
    expect(
      buildConnection({
        query: `query {
          companies {
            totalCount
            pageInfo { hasNextPage }
            edges { cursor node { id people { totalCount } } }
          }
        }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      fields: { id: true },
      aggregates: ['totalCount'],
      relations: {
        people: {
          fieldName: 'people',
          selectedFields: {
            fields: {},
            aggregates: ['totalCount'],
            relations: {},
          },
        },
      },
    });
  });

  it('merges the node selections of edges selected under two aliases', () => {
    expect(
      buildConnection({
        query: `query {
          companies {
            edges { node { id } }
            otherEdges: edges { node { name } }
          }
        }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      fields: { id: true, name: true },
      aggregates: [],
      relations: {},
    });
  });

  it('rejects names reserved for introspection, in a record and in a connection', () => {
    expect(() =>
      buildRecord({
        query: `query { company { __proto__ { id } } }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toThrow('Cannot query field "__proto__"');
    expect(() =>
      buildConnection({
        query: `query { companies { __arguments edges { node { id } } } }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toThrow('Cannot query field "__arguments"');
  });
});
