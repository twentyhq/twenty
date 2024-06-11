import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const fieldNumberMock = {
  name: 'fieldNumber',
  type: FieldMetadataType.NUMBER,
  isNullable: false,
  defaultValue: null,
};

export const fieldTextMock = {
  name: 'fieldText',
  type: FieldMetadataType.TEXT,
  isNullable: true,
  defaultValue: null,
};

export const fieldLinkMock = {
  name: 'fieldLink',
  type: FieldMetadataType.LINK,
  isNullable: false,
  defaultValue: { label: '', url: '' },
};

export const fieldCurrencyMock = {
  name: 'fieldCurrency',
  type: FieldMetadataType.CURRENCY,
  isNullable: true,
  defaultValue: { amountMicros: null, currencyCode: "''" },
};

export const fieldSelectMock = {
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

const fieldRelationMock = {
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
  name: 'fieldLinks',
  type: FieldMetadataType.LINKS,
  isNullable: false,
  defaultValue: [
    { primaryLinkLabel: '', primaryLinkUrl: '', secondaryLinks: {} },
  ],
};

const fieldUuidMock = {
  name: 'fieldUuid',
  type: FieldMetadataType.UUID,
  isNullable: true,
  defaultValue: null,
};

const fieldPhoneMock = {
  name: 'fieldPhone',
  type: FieldMetadataType.PHONE,
  isNullable: true,
  defaultValue: null,
};

const fieldEmailMock = {
  name: 'fieldEmail',
  type: FieldMetadataType.EMAIL,
  isNullable: true,
  defaultValue: null,
};

const fieldDateTimeMock = {
  name: 'fieldDateTime',
  type: FieldMetadataType.DATE_TIME,
  isNullable: true,
  defaultValue: null,
};

const fieldDateMock = {
  name: 'fieldDate',
  type: FieldMetadataType.DATE,
  isNullable: true,
  defaultValue: null,
};

const fieldBooleanMock = {
  name: 'fieldBoolean',
  type: FieldMetadataType.BOOLEAN,
  isNullable: true,
  defaultValue: null,
};

const fieldNumericMock = {
  name: 'fieldNumeric',
  type: FieldMetadataType.NUMERIC,
  isNullable: true,
  defaultValue: null,
};

const fieldProbabilityMock = {
  name: 'fieldProbability',
  type: FieldMetadataType.PROBABILITY,
  isNullable: true,
  defaultValue: null,
};

const fieldFullNameMock = {
  name: 'fieldFullName',
  type: FieldMetadataType.FULL_NAME,
  isNullable: true,
  defaultValue: { firstName: '', lastName: '' },
};

const fieldRatingMock = {
  name: 'fieldRating',
  type: FieldMetadataType.RATING,
  isNullable: true,
  defaultValue: null,
};

const fieldPositionMock = {
  name: 'fieldPosition',
  type: FieldMetadataType.POSITION,
  isNullable: true,
  defaultValue: null,
};

const fieldAddressMock = {
  name: 'fieldAddress',
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
  name: 'fieldRawJson',
  type: FieldMetadataType.RAW_JSON,
  isNullable: true,
  defaultValue: null,
};

export const fields = [
  fieldUuidMock,
  fieldTextMock,
  fieldPhoneMock,
  fieldEmailMock,
  fieldDateTimeMock,
  fieldDateMock,
  fieldBooleanMock,
  fieldNumberMock,
  fieldNumericMock,
  fieldProbabilityMock,
  fieldLinkMock,
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
];

export const objectMetadataItemMock = {
  targetTableName: 'testingObject',
  nameSingular: 'objectName',
  namePlural: 'objectsName',
  fields,
} as ObjectMetadataEntity;
