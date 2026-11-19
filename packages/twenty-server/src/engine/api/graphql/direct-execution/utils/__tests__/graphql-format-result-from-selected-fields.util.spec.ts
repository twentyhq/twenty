import { Kind, parse } from 'graphql';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { graphQLFormatResultFromSelectedFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-format-result-from-selected-fields.util';
import { decodeCursor } from 'src/engine/api/common/utils/cursors.util';
import {
  type GraphqlConnectionResult,
  type GraphqlResolverResult,
} from 'src/engine/api/graphql/direct-execution/types/graphql-resolver-result.type';
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
    id: 'person-id-field-id',
    universalIdentifier: 'person-id-field-id',
    objectMetadataId: PERSON_ID,
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

const format = ({
  result,
  query,
  flatObjectMetadata,
}: {
  result: GraphqlResolverResult;
  query: string;
  flatObjectMetadata: FlatObjectMetadata;
}) => {
  const [operation] = parse(query).definitions;

  if (operation.kind !== Kind.OPERATION_DEFINITION) {
    throw new Error('Expected an operation');
  }

  const [rootField] = operation.selectionSet.selections;

  if (rootField.kind !== Kind.FIELD) {
    throw new Error('Expected a root field');
  }

  return graphQLFormatResultFromSelectedFields({
    result,
    fieldSelections: getGraphqlFieldSelections({
      fieldNodes: [rootField],
      fragments: {},
      variableValues: {},
    }),
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
};

const buildConnection = ({
  records,
  ...connection
}: Pick<GraphqlConnectionResult, 'records'> &
  Partial<GraphqlConnectionResult>): GraphqlConnectionResult => ({
  records,
  connectionValues: { totalCount: records.length },
  hasNextPage: false,
  hasPreviousPage: false,
  ...connection,
});

describe('graphQLFormatResultFromSelectedFields', () => {
  it('projects selected sub-fields of an object-typed composite sub-field', () => {
    expect(
      format({
        result: {
          kind: 'record',
          record: {
            id: 'person-id',
            phones: {
              primaryPhoneNumber: '123456789',
              additionalPhones: [{ number: '987654321', callingCode: '+33' }],
            },
          },
        },
        query: `query {
          person {
            phones {
              primaryPhoneNumber
              extra: additionalPhones { number countryCode __typename }
            }
          }
        }`,
        flatObjectMetadata: PERSON,
      }),
    ).toStrictEqual({
      phones: {
        primaryPhoneNumber: '123456789',
        extra: [
          {
            number: '987654321',
            countryCode: null,
            __typename: 'AdditionalPhone',
          },
        ],
      },
    });
  });

  it('passes through a composite sub-field value that is not an object list', () => {
    expect(
      format({
        result: {
          kind: 'record',
          record: {
            id: 'person-id',
            phones: { additionalPhones: '[{"number":"987654321"}]' },
          },
        },
        query: `query { person { phones { additionalPhones { number } } } }`,
        flatObjectMetadata: PERSON,
      }),
    ).toStrictEqual({
      phones: { additionalPhones: '[{"number":"987654321"}]' },
    });
  });

  it('reads each relation alias from the rows loaded for its arguments', () => {
    const firstPersonKey = computeSelectionKey({
      fieldName: 'people',
      arguments: { first: 1 },
    });

    expect(
      format({
        result: {
          kind: 'connection',
          connection: buildConnection({
            records: [
              {
                id: 'company-id',
                name: 'Acme',
                people: [{ id: 'person-1' }, { id: 'person-2' }],
                [firstPersonKey]: [{ id: 'person-1' }],
              },
            ],
          }),
        },
        query: `query {
          companies {
            count: totalCount
            rows: edges {
              item: node {
                name: people { totalCount }
                firstPerson: people(first: 1) {
                  edges { node { identifier: id } }
                }
                __proto__: people(first: 1) { totalCount }
              }
            }
          }
        }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      count: 1,
      rows: [
        {
          item: Object.fromEntries([
            ['name', { totalCount: 2 }],
            ['firstPerson', { edges: [{ node: { identifier: 'person-1' } }] }],
            ['__proto__', { totalCount: 1 }],
          ]),
        },
      ],
    });
  });

  it('serves one relation under separate edges aliases with other arguments', () => {
    const firstKey = computeSelectionKey({
      fieldName: 'people',
      arguments: { first: 1 },
    });
    const secondKey = computeSelectionKey({
      fieldName: 'people',
      arguments: { first: 2 },
    });

    expect(
      format({
        result: {
          kind: 'connection',
          connection: buildConnection({
            records: [
              {
                id: 'company-id',
                [firstKey]: [{ id: 'person-1' }],
                [secondKey]: [{ id: 'person-1' }, { id: 'person-2' }],
              },
            ],
          }),
        },
        query: `query {
          companies {
            first: edges { node { people(first: 1) { totalCount } } }
            second: edges { node { people(first: 2) { totalCount } } }
          }
        }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      first: [{ node: { people: { totalCount: 1 } } }],
      second: [{ node: { people: { totalCount: 2 } } }],
    });
  });

  it('computes typenames and nulls for to-one relations and missing values', () => {
    expect(
      format({
        result: {
          kind: 'record',
          record: {
            id: 'person-id',
            companyId: 'company-id',
            company: { id: 'company-id' },
          },
        },
        query: `query {
          person {
            kind: __typename
            companyId
            employer: company { __typename id name }
            phones { primaryPhoneNumber }
            notAField
          }
        }`,
        flatObjectMetadata: PERSON,
      }),
    ).toStrictEqual({
      kind: 'Person',
      companyId: 'company-id',
      employer: { __typename: 'Company', id: 'company-id', name: null },
      phones: null,
      notAField: null,
    });
  });

  it('builds edges, cursors and page info from the records of a connection', () => {
    const formatted = format({
      result: {
        kind: 'connection',
        connection: buildConnection({
          records: [{ id: 'company-1' }, { id: 'company-2' }],
          connectionValues: { totalCount: 5, countEmptyName: '3' },
          hasNextPage: true,
        }),
      },
      query: `query {
        companies {
          __typename
          totalCount
          countEmptyName
          edges { __typename cursor node { id } }
          pageInfo { __typename hasNextPage hasPreviousPage startCursor endCursor }
        }
      }`,
      flatObjectMetadata: COMPANY,
    }) as {
      edges: { cursor: string }[];
      pageInfo: { startCursor: string; endCursor: string };
    };

    expect(formatted).toMatchObject({
      __typename: 'CompanyConnection',
      totalCount: 5,
      countEmptyName: 3,
      edges: [
        { __typename: 'CompanyEdge', node: { id: 'company-1' } },
        { __typename: 'CompanyEdge', node: { id: 'company-2' } },
      ],
      pageInfo: {
        __typename: 'PageInfo',
        hasNextPage: true,
        hasPreviousPage: false,
      },
    });
    expect(decodeCursor(formatted.edges[0].cursor)).toEqual({
      id: 'company-1',
    });
    expect(formatted.pageInfo.startCursor).toBe(formatted.edges[0].cursor);
    expect(formatted.pageInfo.endCursor).toBe(formatted.edges[1].cursor);
  });

  it('returns null cursors for an empty connection', () => {
    expect(
      format({
        result: {
          kind: 'connection',
          connection: buildConnection({ records: [] }),
        },
        query: `query { companies { edges { cursor } pageInfo { startCursor endCursor } } }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      edges: [],
      pageInfo: { startCursor: null, endCursor: null },
    });
  });

  it('reads the aggregates of a nested relation for each parent record', () => {
    expect(
      format({
        result: {
          kind: 'connection',
          connection: buildConnection({
            records: [
              { id: 'company-1', people: [{ id: 'person-1' }] },
              { id: 'company-2' },
            ],
            relationAggregatedValues: {
              people: {
                valuesByParentRecordId: { 'company-1': { totalCount: 12 } },
                relations: {},
              },
            },
          }),
        },
        query: `query {
          companies { edges { node { people { totalCount edges { node { id } } } } } }
        }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual({
      edges: [
        {
          node: {
            people: { totalCount: 12, edges: [{ node: { id: 'person-1' } }] },
          },
        },
        { node: { people: { totalCount: 0, edges: [] } } },
      ],
    });
  });

  it('formats each group of a group-by result as a group-by connection', () => {
    expect(
      format({
        result: {
          kind: 'groupByConnections',
          connections: [
            buildConnection({
              records: [{ id: 'company-1', name: 'Acme' }],
              connectionValues: {
                totalCount: 1,
                groupByDimensionValues: ['Acme'],
              },
            }),
          ],
        },
        query: `query {
          companiesGroupBy {
            __typename
            groupByDimensionValues
            totalCount
            edges { node { name } }
          }
        }`,
        flatObjectMetadata: COMPANY,
      }),
    ).toStrictEqual([
      {
        __typename: 'CompanyGroupByConnection',
        groupByDimensionValues: ['Acme'],
        totalCount: 1,
        edges: [{ node: { name: 'Acme' } }],
      },
    ]);
  });
});
