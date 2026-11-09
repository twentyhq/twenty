import { FieldMetadataType } from 'twenty-shared/types';

import { graphQLFormatResultFromSelectedFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-format-result-from-selected-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const PERSON_ID = 'person-object-id';
const PHONES_FIELD_ID = 'phones-field-id';

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
  universalIdentifierById: { [PERSON_ID]: PERSON_ID },
  byUniversalIdentifier: {
    [PERSON_ID]: getFlatObjectMetadataMock({
      id: PERSON_ID,
      universalIdentifier: PERSON_ID,
      nameSingular: 'person',
      fieldIds: [PHONES_FIELD_ID],
    }),
  },
  universalIdentifiersByApplicationId: {},
};

const flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata> = {
  universalIdentifierById: { [PHONES_FIELD_ID]: PHONES_FIELD_ID },
  byUniversalIdentifier: {
    [PHONES_FIELD_ID]: getFlatFieldMetadataMock({
      id: PHONES_FIELD_ID,
      universalIdentifier: PHONES_FIELD_ID,
      objectMetadataId: PERSON_ID,
      name: 'phones',
      type: FieldMetadataType.PHONES,
    }),
  },
  universalIdentifiersByApplicationId: {},
};

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
});
