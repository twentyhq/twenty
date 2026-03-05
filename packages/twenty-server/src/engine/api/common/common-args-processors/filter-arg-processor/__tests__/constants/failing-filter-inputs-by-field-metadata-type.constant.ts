import { joinColumnNameForManyToOneMorphRelationField1 } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

export const failingFilterInputsByFieldMetadataType: {
  [K in FieldMetadataType]?: {
    filter: Record<string, unknown>;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    { filter: { textField: { invalidOperator: 'test' } } },
    { filter: { textField: { eq: 'test', neq: 'test' } } },
    { filter: { textField: {} } },
  ],
  [FieldMetadataType.RICH_TEXT]: [
    { filter: { richTextField: { invalidOperator: 'test' } } },
    { filter: { richTextField: {} } },
  ],
  [FieldMetadataType.NUMBER]: [
    { filter: { numberField: { eq: 'not-a-number' } } },
    { filter: { numberField: { eq: {} } } },
    { filter: { numberField: { eq: [] } } },
    { filter: { numberField: { eq: true } } },
    { filter: { numberField: { invalidOperator: 1 } } },
    { filter: { numberField: { eq: 1, neq: 2 } } },
    { filter: { numberField: {} } },
  ],
  [FieldMetadataType.NUMERIC]: [
    { filter: { numericField: { eq: 'not-a-number' } } },
    { filter: { numericField: { eq: {} } } },
    { filter: { numericField: { invalidOperator: 1 } } },
    { filter: { numericField: {} } },
  ],
  [FieldMetadataType.UUID]: [
    { filter: { uuidField: { eq: 'invalid-uuid' } } },
    { filter: { uuidField: { eq: 2 } } },
    { filter: { uuidField: { eq: {} } } },
    { filter: { uuidField: { eq: [] } } },
    { filter: { uuidField: { eq: true } } },
    { filter: { uuidField: { invalidOperator: 'test' } } },
    { filter: { uuidField: {} } },
  ],
  [FieldMetadataType.BOOLEAN]: [
    { filter: { booleanField: { eq: {} } } },
    { filter: { booleanField: { eq: [] } } },
    { filter: { booleanField: { eq: 1 } } },
    { filter: { booleanField: { invalidOperator: true } } },
    { filter: { booleanField: {} } },
  ],
  [FieldMetadataType.DATE]: [
    { filter: { dateField: { eq: 'malformed-date' } } },
    { filter: { dateField: { eq: {} } } },
    { filter: { dateField: { eq: [] } } },
    { filter: { dateField: { eq: true } } },
    { filter: { dateField: { eq: 1 } } },
    { filter: { dateField: { invalidOperator: '2025-01-01' } } },
    { filter: { dateField: {} } },
  ],
  [FieldMetadataType.DATE_TIME]: [
    { filter: { dateTimeField: { eq: 'malformed-date' } } },
    { filter: { dateTimeField: { eq: {} } } },
    { filter: { dateTimeField: { eq: [] } } },
    { filter: { dateTimeField: { eq: true } } },
    { filter: { dateTimeField: { eq: 1 } } },
    { filter: { dateTimeField: { invalidOperator: '2025-01-01T10:00:00Z' } } },
    { filter: { dateTimeField: {} } },
  ],
  [FieldMetadataType.SELECT]: [
    { filter: { selectField: { invalidOperator: 'OPTION_1' } } },
    { filter: { selectField: {} } },
    { filter: { selectField: { eq: 'OPTION_1', neq: 'OPTION_2' } } },
  ],
  [FieldMetadataType.RATING]: [
    { filter: { ratingField: { invalidOperator: 'RATING_1' } } },
    { filter: { ratingField: {} } },
    { filter: { ratingField: { eq: 'RATING_1', neq: 'RATING_2' } } },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    { filter: { multiSelectField: { invalidOperator: ['OPTION_1'] } } },
    { filter: { multiSelectField: {} } },
    { filter: { multiSelectField: { containsAny: 'not-an-array' } } },
  ],
  [FieldMetadataType.ARRAY]: [
    { filter: { arrayField: { invalidOperator: 'test' } } },
    { filter: { arrayField: {} } },
    { filter: { arrayField: { containsIlike: 'test', is: 'NULL' } } },
  ],
  [FieldMetadataType.RAW_JSON]: [
    { filter: { rawJsonField: { invalidOperator: 'test' } } },
    { filter: { rawJsonField: {} } },
  ],
  [FieldMetadataType.RELATION]: [
    { filter: { manyToOneRelationFieldId: { eq: 'invalid-uuid' } } },
    { filter: { manyToOneRelationFieldId: { invalidOperator: 'test' } } },
    { filter: { manyToOneRelationFieldId: {} } },
  ],
  [FieldMetadataType.MORPH_RELATION]: [
    {
      filter: {
        [joinColumnNameForManyToOneMorphRelationField1]: { eq: 'invalid-uuid' },
      },
    },
    {
      filter: {
        [joinColumnNameForManyToOneMorphRelationField1]: {
          invalidOperator: 'test',
        },
      },
    },
    {
      filter: { [joinColumnNameForManyToOneMorphRelationField1]: {} },
    },
  ],
  [FieldMetadataType.POSITION]: [
    { filter: { position: { eq: 'not-a-number' } } },
    { filter: { position: { eq: {} } } },
    { filter: { position: { invalidOperator: 1 } } },
    { filter: { position: {} } },
  ],
  [FieldMetadataType.FILES]: [
    { filter: { filesField: { invalidOperator: 'test' } } },
    { filter: { filesField: {} } },
  ],
  [FieldMetadataType.RICH_TEXT_V2]: [
    { filter: { richTextV2Field: { invalidOperator: 'test' } } },
    { filter: { richTextV2Field: { markdown: { invalidOperator: 'test' } } } },
  ],
  [FieldMetadataType.ADDRESS]: [
    { filter: { addressField: { invalidSubField: { eq: 'test' } } } },
    { filter: { addressField: { addressCity: { invalidOperator: 'test' } } } },
    { filter: { addressField: { addressCity: {} } } },
  ],
  [FieldMetadataType.CURRENCY]: [
    { filter: { currencyField: { invalidSubField: { eq: 'test' } } } },
    {
      filter: { currencyField: { amountMicros: { invalidOperator: 'test' } } },
    },
    { filter: { currencyField: { amountMicros: { eq: 'not-a-number' } } } },
  ],
  [FieldMetadataType.EMAILS]: [
    { filter: { emailsField: { invalidSubField: { eq: 'test' } } } },
    {
      filter: { emailsField: { primaryEmail: { invalidOperator: 'test' } } },
    },
  ],
  [FieldMetadataType.PHONES]: [
    { filter: { phonesField: { invalidSubField: { eq: 'test' } } } },
    {
      filter: {
        phonesField: { primaryPhoneNumber: { invalidOperator: 'test' } },
      },
    },
  ],
  [FieldMetadataType.FULL_NAME]: [
    { filter: { fullNameField: { invalidSubField: { eq: 'test' } } } },
    { filter: { fullNameField: { firstName: { invalidOperator: 'test' } } } },
  ],
  [FieldMetadataType.LINKS]: [
    { filter: { linksField: { invalidSubField: { eq: 'test' } } } },
    {
      filter: { linksField: { primaryLinkUrl: { invalidOperator: 'test' } } },
    },
  ],
  [FieldMetadataType.ACTOR]: [
    { filter: { actorField: { invalidSubField: { eq: 'test' } } } },
    { filter: { actorField: { source: { invalidOperator: 'test' } } } },
    { filter: { actorField: { workspaceMemberId: { eq: 'invalid-uuid' } } } },
  ],
};
