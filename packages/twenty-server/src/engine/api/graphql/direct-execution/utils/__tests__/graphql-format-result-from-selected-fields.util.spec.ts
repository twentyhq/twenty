import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { graphQLFormatResultFromSelectedFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-format-result-from-selected-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const PERSON_ID = 'person-object-id';
const COMPANY_ID = 'company-object-id';
const PHONES_FIELD_ID = 'phones-field-id';
const COMPANY_FIELD_ID = 'company-field-id';

const flatObjectMetadataMaps = {
  universalIdentifierById: { [PERSON_ID]: PERSON_ID, [COMPANY_ID]: COMPANY_ID },
  byUniversalIdentifier: {
    [PERSON_ID]: {
      id: PERSON_ID,
      nameSingular: 'person',
      fieldIds: [PHONES_FIELD_ID, COMPANY_FIELD_ID],
    },
    [COMPANY_ID]: {
      id: COMPANY_ID,
      nameSingular: 'company',
      fieldIds: [],
    },
  },
} as unknown as FlatEntityMaps<FlatObjectMetadata>;

const flatFieldMetadataMaps = {
  universalIdentifierById: {
    [PHONES_FIELD_ID]: PHONES_FIELD_ID,
    [COMPANY_FIELD_ID]: COMPANY_FIELD_ID,
  },
  byUniversalIdentifier: {
    [PHONES_FIELD_ID]: {
      id: PHONES_FIELD_ID,
      name: 'phones',
      type: FieldMetadataType.PHONES,
    },
    [COMPANY_FIELD_ID]: {
      id: COMPANY_FIELD_ID,
      name: 'company',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
      relationTargetObjectMetadataId: COMPANY_ID,
    },
  },
} as unknown as FlatEntityMaps<OrmFlatFieldMetadata>;

const formatPerson = (phones: unknown) =>
  graphQLFormatResultFromSelectedFields(
    { id: 'record-id', phones },
    {
      phones: {
        primaryPhoneNumber: {},
        additionalPhones: { number: {}, countryCode: {}, __typename: {} },
      },
    },
    'person',
    {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular: { person: PERSON_ID },
      method: 'findOne',
    },
  );

describe('graphQLFormatResultFromSelectedFields', () => {
  it('projects selected sub-fields of an object-typed composite sub-field', () => {
    expect(
      formatPerson({
        primaryPhoneNumber: '123456789',
        additionalPhones: [{ number: '987654321', callingCode: '+33' }],
      }),
    ).toStrictEqual({
      phones: {
        primaryPhoneNumber: '123456789',
        additionalPhones: [
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
      formatPerson({
        primaryPhoneNumber: '123456789',
        additionalPhones: '[{"number":"987654321"}]',
      }),
    ).toStrictEqual({
      phones: {
        primaryPhoneNumber: '123456789',
        additionalPhones: '[{"number":"987654321"}]',
      },
    });
  });

  it('formats aggregates reached through a many-to-one relation on a connection', () => {
    expect(
      graphQLFormatResultFromSelectedFields(
        {
          edges: [],
          pageInfo: { hasNextPage: false, hasPreviousPage: false },
          totalCount: 4,
          countEmptyCity: '2',
          company: { sumEmployees: '60', countEmptyEmployees: '1' },
        },
        {
          totalCount: {},
          countEmptyCity: {},
          company: {
            sumEmployees: {},
            countEmptyEmployees: {},
            avgEmployees: {},
            __typename: {},
          },
        },
        'person',
        {
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          objectIdByNameSingular: { person: PERSON_ID, company: COMPANY_ID },
          method: 'findMany',
        },
      ),
    ).toStrictEqual({
      totalCount: 4,
      countEmptyCity: 2,
      company: {
        sumEmployees: 60,
        countEmptyEmployees: 1,
        avgEmployees: null,
        __typename: 'CompanyAggregation',
      },
    });
  });
});
