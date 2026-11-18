import { Kind, parse } from 'graphql';
import {
  FieldMetadataType,
  type ObjectRecord,
  RelationType,
} from 'twenty-shared/types';

import { graphQLFormatResultFromSelectedFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-format-result-from-selected-fields.util';
import { type IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { type ResolverOutput } from 'src/engine/api/graphql/workspace-query-runner/interfaces/resolver-output';
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
    fieldIds: ['company-name-field-id', 'company-people-field-id'],
  }),
  getFlatObjectMetadataMock({
    id: PERSON_ID,
    universalIdentifier: PERSON_ID,
    nameSingular: 'person',
    fieldIds: ['person-phones-field-id', 'person-company-field-id'],
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

const format = ({
  result,
  query,
  objectNameSingular,
}: {
  result: ResolverOutput;
  query: string;
  objectNameSingular: string;
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
    objectNameSingular,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular: { company: COMPANY_ID, person: PERSON_ID },
  });
};

const buildConnection = (
  records: ObjectRecord[],
): IConnection<ObjectRecord> => ({
  edges: records.map((node) => ({ node, cursor: `cursor-${node.id}` })),
  pageInfo: { hasNextPage: false, hasPreviousPage: false },
  totalCount: records.length,
});

describe('graphQLFormatResultFromSelectedFields', () => {
  it('projects selected sub-fields of an object-typed composite sub-field', () => {
    expect(
      format({
        result: {
          id: 'person-id',
          phones: {
            primaryPhoneNumber: '123456789',
            additionalPhones: [{ number: '987654321', callingCode: '+33' }],
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
        objectNameSingular: 'person',
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
          id: 'person-id',
          phones: { additionalPhones: '[{"number":"987654321"}]' },
        },
        query: `query { person { phones { additionalPhones { number } } } }`,
        objectNameSingular: 'person',
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
        result: buildConnection([
          {
            id: 'company-id',
            name: 'Acme',
            people: buildConnection([{ id: 'person-1' }, { id: 'person-2' }]),
            [firstPersonKey]: buildConnection([{ id: 'person-1' }]),
          },
        ]),
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
        objectNameSingular: 'company',
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
        result: buildConnection([
          {
            id: 'company-id',
            [firstKey]: buildConnection([{ id: 'person-1' }]),
            [secondKey]: buildConnection([
              { id: 'person-1' },
              { id: 'person-2' },
            ]),
          },
        ]),
        query: `query {
          companies {
            first: edges { node { people(first: 1) { totalCount } } }
            second: edges { node { people(first: 2) { totalCount } } }
          }
        }`,
        objectNameSingular: 'company',
      }),
    ).toStrictEqual({
      first: [{ node: { people: { totalCount: 1 } } }],
      second: [{ node: { people: { totalCount: 2 } } }],
    });
  });

  it('computes typenames and nulls for to-one relations and missing values', () => {
    expect(
      format({
        result: { id: 'person-id', company: { id: 'company-id' } },
        query: `query {
          person {
            kind: __typename
            employer: company { __typename id name }
            phones { primaryPhoneNumber }
          }
        }`,
        objectNameSingular: 'person',
      }),
    ).toStrictEqual({
      kind: 'Person',
      employer: { __typename: 'Company', id: 'company-id', name: null },
      phones: null,
    });
  });
});
