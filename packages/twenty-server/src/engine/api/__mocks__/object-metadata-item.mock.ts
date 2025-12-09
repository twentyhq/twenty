import {
  FieldMetadataType,
  RelationOnDeleteAction,
  FieldActorSource,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

export const FIELD_LINKS_MOCK_NAME = 'fieldLinks';
export const FIELD_CURRENCY_MOCK_NAME = 'fieldCurrency';
export const FIELD_ADDRESS_MOCK_NAME = 'fieldAddress';
export const FIELD_ACTOR_MOCK_NAME = 'fieldActor';
export const FIELD_FULL_NAME_MOCK_NAME = 'fieldFullName';
export const FIELD_PHONES_MOCK_NAME = 'fieldPhones';

const workspaceId = '20202020-0000-0000-0000-000000000000';
const objectMetadataId = '20202020-0000-0000-0000-000000000001';

export const fieldNumberMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldNumberId',
  name: 'fieldNumber',
  type: FieldMetadataType.NUMBER,
  label: 'Field Number',
  isNullable: false,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldTextMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldTextId',
  name: 'fieldText',
  type: FieldMetadataType.TEXT,
  label: 'Field Text',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldCurrencyMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldCurrencyId',
  name: FIELD_CURRENCY_MOCK_NAME,
  type: FieldMetadataType.CURRENCY,
  label: 'Field Currency',
  isNullable: true,
  defaultValue: { amountMicros: null, currencyCode: "''" },
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldSelectMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldSelectId',
  name: 'fieldSelect',
  type: FieldMetadataType.SELECT,
  label: 'Field Select',
  isNullable: true,
  defaultValue: 'OPTION_1',
  options: [
    {
      id: '9a519a86-422b-4598-88ae-78751353f683',
      label: 'Opt 1',
      value: 'OPTION_1',
      position: 0,
      color: 'red',
    },
    {
      id: '33f28d51-bc82-4e1d-ae4b-d9e4c0ed0ab4',
      label: 'Opt 2',
      value: 'OPTION_2',
      position: 1,
      color: 'purple',
    },
  ],
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldMultiSelectMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldMultiSelectId',
  name: 'fieldMultiSelect',
  type: FieldMetadataType.MULTI_SELECT,
  label: 'Field Multi Select',
  isNullable: true,
  defaultValue: ['OPTION_1'],
  options: [
    {
      id: '9a519a86-422b-4598-88ae-78751353f683',
      label: 'Opt 1',
      value: 'OPTION_1',
      position: 0,
      color: 'red',
    },
    {
      id: '33f28d51-bc82-4e1d-ae4b-d9e4c0ed0ab4',
      label: 'Opt 2',
      value: 'OPTION_2',
      position: 1,
      color: 'purple',
    },
  ],
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldRelationMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldRelationId',
  name: 'fieldRelation',
  type: FieldMetadataType.RELATION,
  label: 'Field Relation',
  isNullable: true,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'fieldRelationId',
    onDelete: RelationOnDeleteAction.CASCADE,
  },
  relationTargetObjectMetadata: {
    id: 'relationTargetObjectId',
    nameSingular: 'relationTargetObject',
    namePlural: 'relationTargetObjects',
  } as ObjectMetadataEntity,
  relationTargetObjectMetadataId: 'relationTargetObjectId',
  relationTargetFieldMetadata: {
    id: 'relationTargetFieldId',
    name: 'relationTargetField',
  } as FieldMetadataEntity,
  relationTargetFieldMetadataId: 'relationTargetFieldId',
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldLinksMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldLinksId',
  name: FIELD_LINKS_MOCK_NAME,
  type: FieldMetadataType.LINKS,
  label: 'Field Links',
  isNullable: false,
  defaultValue: {
    primaryLinkLabel: '',
    primaryLinkUrl: '',
    secondaryLinks: [],
  },
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldUuidMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldUuidId',
  name: 'fieldUuid',
  type: FieldMetadataType.UUID,
  label: 'Field UUID',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldDateTimeMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldDateTimeId',
  name: 'fieldDateTime',
  type: FieldMetadataType.DATE_TIME,
  label: 'Field Date Time',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldDateMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldDateId',
  name: 'fieldDate',
  type: FieldMetadataType.DATE,
  label: 'Field Date',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldBooleanMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldBooleanId',
  name: 'fieldBoolean',
  type: FieldMetadataType.BOOLEAN,
  label: 'Field Boolean',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldNumericMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldNumericId',
  name: 'fieldNumeric',
  type: FieldMetadataType.NUMERIC,
  label: 'Field Numeric',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldFullNameMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldFullNameId',
  name: FIELD_FULL_NAME_MOCK_NAME,
  type: FieldMetadataType.FULL_NAME,
  label: 'Field Full Name',
  isNullable: true,
  defaultValue: { firstName: '', lastName: '' },
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldRatingMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldRatingId',
  name: 'fieldRating',
  type: FieldMetadataType.RATING,
  label: 'Field Rating',
  isNullable: true,
  defaultValue: 'RATING_1',
  options: [
    {
      id: '9a519a86-422b-4598-88ae-78751353f683',
      label: 'Opt 1',
      value: 'RATING_1',
      position: 0,
      color: 'red',
    },
    {
      id: '33f28d51-bc82-4e1d-ae4b-d9e4c0ed0ab4',
      label: 'Opt 2',
      value: 'RATING_2',
      position: 1,
      color: 'purple',
    },
  ] as FieldMetadataComplexOption[],
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldPositionMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldPositionId',
  name: 'fieldPosition',
  type: FieldMetadataType.POSITION,
  label: 'Field Position',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldAddressMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldAddressId',
  name: FIELD_ADDRESS_MOCK_NAME,
  type: FieldMetadataType.ADDRESS,
  label: 'Field Address',
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
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldRawJsonMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldRawJsonId',
  name: 'fieldRawJson',
  type: FieldMetadataType.RAW_JSON,
  label: 'Field Raw JSON',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldRichTextMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldRichTextId',
  name: 'fieldRichText',
  type: FieldMetadataType.RICH_TEXT,
  label: 'Field Rich Text',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldActorMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldActorId',
  name: FIELD_ACTOR_MOCK_NAME,
  type: FieldMetadataType.ACTOR,
  label: 'Field Actor',
  isNullable: true,
  defaultValue: {
    source: FieldActorSource.MANUAL,
    name: '',
  },
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldEmailsMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldEmailsId',
  name: 'fieldEmails',
  type: FieldMetadataType.EMAILS,
  label: 'Field Emails',
  isNullable: false,
  defaultValue: {
    primaryEmail: '',
    additionalEmails: {},
  },
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldArrayMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldArrayId',
  name: 'fieldArray',
  type: FieldMetadataType.ARRAY,
  label: 'Field Array',
  isNullable: true,
  defaultValue: null,
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fieldPhonesMock = getMockFieldMetadataEntity({
  workspaceId,
  objectMetadataId,
  id: 'fieldPhonesId',
  name: FIELD_PHONES_MOCK_NAME,
  type: FieldMetadataType.PHONES,
  label: 'Field Phones',
  isNullable: false,
  defaultValue: {
    primaryPhoneNumber: '',
    primaryPhoneCountryCode: '',
    primaryPhoneCallingCode: '',
    additionalPhones: {},
  },
  isLabelSyncedWithName: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const FIELDS_MOCK = [
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

export const objectMetadataItemMock: ObjectMetadataEntity = {
  id: objectMetadataId,
  workspaceId,
  nameSingular: 'objectName',
  namePlural: 'objectNames',
  labelSingular: 'Object Name',
  labelPlural: 'Object Names',
  description: 'Object description',
  icon: 'Icon123',
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  fields: FIELDS_MOCK,
  createdAt: new Date(),
  updatedAt: new Date(),
} as ObjectMetadataEntity;
