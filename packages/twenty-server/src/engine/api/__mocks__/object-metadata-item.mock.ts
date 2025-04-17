import { FieldMetadataType } from 'twenty-shared/types';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const FIELD_LINKS_MOCK_NAME = 'fieldLinks';
export const FIELD_CURRENCY_MOCK_NAME = 'fieldCurrency';
export const FIELD_ADDRESS_MOCK_NAME = 'fieldAddress';
export const FIELD_ACTOR_MOCK_NAME = 'fieldActor';
export const FIELD_FULL_NAME_MOCK_NAME = 'fieldFullName';
export const FIELD_PHONES_MOCK_NAME = 'fieldPhones';

export const fieldNumberMock = {
  id: 'fieldNumberId',
  name: 'fieldNumber',
  type: FieldMetadataType.NUMBER,
  isNullable: false,
  defaultValue: null,
};

export const fieldTextMock = {
  id: 'fieldTextId',
  name: 'fieldText',
  type: FieldMetadataType.TEXT,
  isNullable: true,
  defaultValue: null,
};

export const fieldCurrencyMock = {
  id: 'fieldCurrencyId',
  name: FIELD_CURRENCY_MOCK_NAME,
  type: FieldMetadataType.CURRENCY,
  isNullable: true,
  defaultValue: { amountMicros: null, currencyCode: "''" },
};

export const fieldSelectMock = {
  id: 'fieldSelectId',
  name: 'fieldSelect',
  type: FieldMetadataType.SELECT,
  isNullable: true,
  defaultValue: 'OPTION_1',
  options: [
    {
      id: '9a519a86-422b-4598-88ae-78751353f683',
      color: 'red',
      label: 'Opt 1',
      value: 'OPTION_1',
      position: 0,
    },
    {
      id: '33f28d51-bc82-4e1d-ae4b-d9e4c0ed0ab4',
      color: 'purple',
      label: 'Opt 2',
      value: 'OPTION_2',
      position: 1,
    },
  ],
};

const fieldMultiSelectMock = {
  id: 'fieldMultiSelectId',
  name: 'fieldMultiSelect',
  type: FieldMetadataType.MULTI_SELECT,
  isNullable: true,
  defaultValue: "{'OPTION_1'}",
  options: [
    {
      id: '9a519a86-422b-4598-88ae-78751353f683',
      color: 'red',
      label: 'Opt 1',
      value: 'OPTION_1',
      position: 0,
    },
    {
      id: '33f28d51-bc82-4e1d-ae4b-d9e4c0ed0ab4',
      color: 'purple',
      label: 'Opt 2',
      value: 'OPTION_2',
      position: 1,
    },
  ],
};

export const fieldRelationMock = {
  id: 'fieldRelationId',
  name: 'fieldRelation',
  type: FieldMetadataType.RELATION,
  fromRelationMetadata: {
    toObjectMetadata: {
      nameSingular: 'toObjectMetadataName',
    },
  },
  isNullable: true,
  defaultValue: null,
};

const fieldLinksMock = {
  id: 'fieldLinksId',
  name: FIELD_LINKS_MOCK_NAME,
  type: FieldMetadataType.LINKS,
  isNullable: false,
  defaultValue: [
    { primaryLinkLabel: '', primaryLinkUrl: '', secondaryLinks: [] },
  ],
};

const fieldUuidMock = {
  id: 'fieldUuidId',
  name: 'fieldUuid',
  type: FieldMetadataType.UUID,
  isNullable: true,
  defaultValue: null,
};

const fieldDateTimeMock = {
  id: 'fieldDateTimeId',
  name: 'fieldDateTime',
  type: FieldMetadataType.DATE_TIME,
  isNullable: true,
  defaultValue: null,
};

const fieldDateMock = {
  id: 'fieldDateId',
  name: 'fieldDate',
  type: FieldMetadataType.DATE,
  isNullable: true,
  defaultValue: null,
};

const fieldBooleanMock = {
  id: 'fieldBooleanId',
  name: 'fieldBoolean',
  type: FieldMetadataType.BOOLEAN,
  isNullable: true,
  defaultValue: null,
};

const fieldNumericMock = {
  id: 'fieldNumericId',
  name: 'fieldNumeric',
  type: FieldMetadataType.NUMERIC,
  isNullable: true,
  defaultValue: null,
};

const fieldFullNameMock = {
  id: 'fieldFullNameId',
  name: FIELD_FULL_NAME_MOCK_NAME,
  type: FieldMetadataType.FULL_NAME,
  isNullable: true,
  defaultValue: { firstName: '', lastName: '' },
};

const fieldRatingMock = {
  id: 'fieldRatingId',
  name: 'fieldRating',
  type: FieldMetadataType.RATING,
  isNullable: true,
  defaultValue: 'RATING_1',
  options: [
    {
      id: '9a519a86-422b-4598-88ae-78751353f683',
      color: 'red',
      label: 'Opt 1',
      value: 'RATING_1',
      position: 0,
    },
    {
      id: '33f28d51-bc82-4e1d-ae4b-d9e4c0ed0ab4',
      color: 'purple',
      label: 'Opt 2',
      value: 'RATING_2',
      position: 1,
    },
  ],
};

const fieldPositionMock = {
  id: 'fieldPositionId',
  name: 'fieldPosition',
  type: FieldMetadataType.POSITION,
  isNullable: true,
  defaultValue: null,
};

const fieldAddressMock = {
  id: 'fieldAddressId',
  name: FIELD_ADDRESS_MOCK_NAME,
  type: FieldMetadataType.ADDRESS,
  isNullable: true,
  defaultValue: {
    addressStreet1: '',
    addressStreet2: null,
    addressCity: null,
    addressState: null,
    addressCountry: null,
    addressPostcode: null,
    addressLat: null,
    addressLng: null,
  },
};

const fieldRawJsonMock = {
  id: 'fieldRawJsonId',
  name: 'fieldRawJson',
  type: FieldMetadataType.RAW_JSON,
  isNullable: true,
  defaultValue: null,
};

const fieldRichTextMock = {
  id: 'fieldRichTextId',
  name: 'fieldRichText',
  type: FieldMetadataType.RICH_TEXT,
  isNullable: true,
  defaultValue: null,
};

const fieldActorMock = {
  id: 'fieldActorId',
  name: FIELD_ACTOR_MOCK_NAME,
  type: FieldMetadataType.ACTOR,
  isNullable: true,
  defaultValue: {
    source: FieldActorSource.MANUAL,
    name: '',
  },
};

const fieldEmailsMock = {
  id: 'fieldEmailsId',
  name: 'fieldEmails',
  type: FieldMetadataType.EMAILS,
  isNullable: false,
  defaultValue: [{ primaryEmail: '', additionalEmails: {} }],
};

const fieldArrayMock = {
  id: 'fieldArrayId',
  name: 'fieldArray',
  type: FieldMetadataType.ARRAY,
  isNullable: true,
  defaultValue: null,
};

const fieldPhonesMock = {
  id: 'fieldPhonesId',
  name: FIELD_PHONES_MOCK_NAME,
  type: FieldMetadataType.PHONES,
  isNullable: false,
  defaultValue: [
    {
      primaryPhoneNumber: '',
      primaryPhoneCountryCode: '',
      primaryPhoneCallingCode: '',
      additionalPhones: {},
    },
  ],
};

export const fields = [
  fieldUuidMock,
  fieldTextMock,
  fieldPhonesMock,
  fieldEmailsMock,
  fieldDateTimeMock,
  fieldDateMock,
  fieldBooleanMock,
  fieldNumberMock,
  fieldNumericMock,
  fieldLinksMock,
  fieldCurrencyMock,
  fieldFullNameMock,
  fieldRatingMock,
  fieldSelectMock,
  fieldMultiSelectMock,
  fieldRelationMock,
  fieldPositionMock,
  fieldAddressMock,
  fieldRawJsonMock,
  fieldRichTextMock,
  fieldActorMock,
  fieldArrayMock,
];

export const objectMetadataItemMock = {
  targetTableName: 'testingObject',
  id: 'mockObjectId',
  nameSingular: 'objectName',
  namePlural: 'objectsName',
  fields,
} as ObjectMetadataEntity;

export const objectMetadataMapItemMock = {
  id: 'mockObjectId',
  nameSingular: 'objectName',
  namePlural: 'objectsName',
  fields,
  fieldsById: fields.reduce((acc, field) => {
    acc[field.id] = field;

    return acc;
  }, {}),
  fieldsByName: fields.reduce((acc, field) => {
    acc[field.name] = field;

    return acc;
  }, {}),
} as ObjectMetadataItemWithFieldMaps;

export const objectMetadataMapsMock = {
  byId: {
    [objectMetadataMapItemMock.id || 'mock-id']: objectMetadataMapItemMock,
  },
  idByNameSingular: {
    [objectMetadataMapItemMock.nameSingular]:
      objectMetadataMapItemMock.id || 'mock-id',
  },
};
