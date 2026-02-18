import { joinColumnNameForManyToOneMorphRelationField1 } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import {
  type FieldMetadataDefaultOption,
  type FieldMetadataOptions,
  type FieldMetadataSettings,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';

export type FieldMetadataConfig = {
  name: string;
  type: FieldMetadataType;
  isNullable: boolean;
  options?: FieldMetadataOptions;
  settings?: FieldMetadataSettings;
  defaultValue?: unknown;
};

export const fieldMetadataConfigByFieldName: Record<
  string,
  FieldMetadataConfig
> = {
  textField: {
    name: 'textField',
    type: FieldMetadataType.TEXT,
    isNullable: true,
  },
  numberField: {
    name: 'numberField',
    type: FieldMetadataType.NUMBER,
    isNullable: true,
  },
  numericField: {
    name: 'numericField',
    type: FieldMetadataType.NUMERIC,
    isNullable: true,
  },
  uuidField: {
    name: 'uuidField',
    type: FieldMetadataType.UUID,
    isNullable: true,
  },
  selectField: {
    name: 'selectField',
    type: FieldMetadataType.SELECT,
    isNullable: true,
    options: [
      { value: 'OPTION_1' },
      { value: 'OPTION_2' },
    ] as FieldMetadataDefaultOption[],
  },
  manyToOneRelationFieldId: {
    name: 'manyToOneRelationFieldId',
    type: FieldMetadataType.RELATION,
    isNullable: true,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'manyToOneRelationFieldId',
    },
  },
  rawJsonField: {
    name: 'rawJsonField',
    type: FieldMetadataType.RAW_JSON,
    isNullable: true,
  },
  arrayField: {
    name: 'arrayField',
    type: FieldMetadataType.ARRAY,
    isNullable: true,
  },
  ratingField: {
    name: 'ratingField',
    type: FieldMetadataType.RATING,
    isNullable: true,
    options: [
      { value: 'RATING_1' },
      { value: 'RATING_2' },
      { value: 'RATING_3' },
      { value: 'RATING_4' },
      { value: 'RATING_5' },
    ] as FieldMetadataDefaultOption[],
  },
  multiSelectField: {
    name: 'multiSelectField',
    type: FieldMetadataType.MULTI_SELECT,
    isNullable: true,
    options: [
      { value: 'OPTION_1' },
      { value: 'OPTION_2' },
    ] as FieldMetadataDefaultOption[],
  },
  dateField: {
    name: 'dateField',
    type: FieldMetadataType.DATE,
    isNullable: true,
  },
  dateTimeField: {
    name: 'dateTimeField',
    type: FieldMetadataType.DATE_TIME,
    isNullable: true,
  },
  booleanField: {
    name: 'booleanField',
    type: FieldMetadataType.BOOLEAN,
    isNullable: true,
  },
  addressField: {
    name: 'addressField',
    type: FieldMetadataType.ADDRESS,
    isNullable: true,
  },
  currencyField: {
    name: 'currencyField',
    type: FieldMetadataType.CURRENCY,
    isNullable: true,
  },
  emailsField: {
    name: 'emailsField',
    type: FieldMetadataType.EMAILS,
    isNullable: true,
  },
  phonesField: {
    name: 'phonesField',
    type: FieldMetadataType.PHONES,
    isNullable: true,
  },
  fullNameField: {
    name: 'fullNameField',
    type: FieldMetadataType.FULL_NAME,
    isNullable: true,
  },
  linksField: {
    name: 'linksField',
    type: FieldMetadataType.LINKS,
    isNullable: true,
  },
  richTextV2Field: {
    name: 'richTextV2Field',
    type: FieldMetadataType.RICH_TEXT_V2,
    isNullable: true,
  },
  richTextField: {
    name: 'richTextField',
    type: FieldMetadataType.RICH_TEXT,
    isNullable: true,
  },
  position: {
    name: 'position',
    type: FieldMetadataType.POSITION,
    isNullable: true,
  },
  filesField: {
    name: 'filesField',
    type: FieldMetadataType.FILES,
    isNullable: true,
    settings: {} as FieldMetadataSettings,
  },
  actorField: {
    name: 'actorField',
    type: FieldMetadataType.ACTOR,
    isNullable: true,
  },
  [joinColumnNameForManyToOneMorphRelationField1]: {
    name: joinColumnNameForManyToOneMorphRelationField1,
    type: FieldMetadataType.MORPH_RELATION,
    isNullable: true,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: joinColumnNameForManyToOneMorphRelationField1,
    },
  },
};
