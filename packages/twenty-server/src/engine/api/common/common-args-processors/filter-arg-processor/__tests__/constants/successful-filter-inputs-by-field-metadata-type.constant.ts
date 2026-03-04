import { joinColumnNameForManyToOneMorphRelationField1 } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

const TEST_UUID = '20202020-b21e-4ec2-873b-de4264d89021';

export const successfulFilterInputsByFieldMetadataType: {
  [K in FieldMetadataType]?: {
    filter: Record<string, unknown>;
    expected?: Record<string, unknown>;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    { filter: { textField: { eq: 'test' } } },
    { filter: { textField: { neq: 'test' } } },
    { filter: { textField: { like: '%test%' } } },
    { filter: { textField: { ilike: '%test%' } } },
    { filter: { textField: { startsWith: 'test' } } },
    { filter: { textField: { endsWith: 'test' } } },
    { filter: { textField: { in: ['test1', 'test2'] } } },
    { filter: { textField: { is: 'NULL' } } },
    { filter: { textField: { is: 'NOT_NULL' } } },
    { filter: { textField: { eq: null } } },
  ],
  [FieldMetadataType.RICH_TEXT]: [
    { filter: { richTextField: { eq: 'test' } } },
    { filter: { richTextField: { like: '%test%' } } },
    { filter: { richTextField: { ilike: '%test%' } } },
    { filter: { richTextField: { is: 'NULL' } } },
    { filter: { richTextField: { is: 'NOT_NULL' } } },
  ],
  [FieldMetadataType.NUMBER]: [
    { filter: { numberField: { eq: 1 } } },
    { filter: { numberField: { neq: 1 } } },
    { filter: { numberField: { gt: 0 } } },
    { filter: { numberField: { gte: 0 } } },
    { filter: { numberField: { lt: 10 } } },
    { filter: { numberField: { lte: 10 } } },
    { filter: { numberField: { in: [1, 2, 3] } } },
    { filter: { numberField: { is: 'NULL' } } },
    { filter: { numberField: { is: 'NOT_NULL' } } },
    { filter: { numberField: { eq: null } } },
    {
      filter: { numberField: { eq: '1' } },
      expected: { numberField: { eq: 1 } },
    },
    { filter: { numberField: { eq: 0 } } },
    { filter: { numberField: { eq: -1.5 } } },
  ],
  [FieldMetadataType.NUMERIC]: [
    { filter: { numericField: { eq: 1 } } },
    { filter: { numericField: { neq: 1 } } },
    { filter: { numericField: { gt: 0 } } },
    { filter: { numericField: { gte: 0 } } },
    { filter: { numericField: { lt: 10 } } },
    { filter: { numericField: { lte: 10 } } },
    { filter: { numericField: { in: [1, 2, 3] } } },
    { filter: { numericField: { is: 'NULL' } } },
    { filter: { numericField: { is: 'NOT_NULL' } } },
    { filter: { numericField: { eq: null } } },
  ],
  [FieldMetadataType.UUID]: [
    { filter: { uuidField: { eq: TEST_UUID } } },
    { filter: { uuidField: { neq: TEST_UUID } } },
    { filter: { uuidField: { in: [TEST_UUID] } } },
    { filter: { uuidField: { is: 'NULL' } } },
    { filter: { uuidField: { is: 'NOT_NULL' } } },
    { filter: { uuidField: { eq: null } } },
  ],
  [FieldMetadataType.BOOLEAN]: [
    { filter: { booleanField: { eq: true } } },
    { filter: { booleanField: { eq: false } } },
    { filter: { booleanField: { is: 'NULL' } } },
    { filter: { booleanField: { is: 'NOT_NULL' } } },
    { filter: { booleanField: { eq: null } } },
    {
      filter: { booleanField: { eq: 'true' } },
      expected: { booleanField: { eq: true } },
    },
    {
      filter: { booleanField: { eq: 'false' } },
      expected: { booleanField: { eq: false } },
    },
  ],
  [FieldMetadataType.DATE]: [
    { filter: { dateField: { eq: '2025-01-13' } } },
    { filter: { dateField: { neq: '2025-01-13' } } },
    { filter: { dateField: { gt: '2025-01-01' } } },
    { filter: { dateField: { gte: '2025-01-01' } } },
    { filter: { dateField: { lt: '2025-12-31' } } },
    { filter: { dateField: { lte: '2025-12-31' } } },
    { filter: { dateField: { in: ['2025-01-01', '2025-01-02'] } } },
    { filter: { dateField: { is: 'NULL' } } },
    { filter: { dateField: { is: 'NOT_NULL' } } },
    { filter: { dateField: { eq: null } } },
  ],
  [FieldMetadataType.DATE_TIME]: [
    { filter: { dateTimeField: { eq: '2025-01-13T10:30:00Z' } } },
    { filter: { dateTimeField: { neq: '2025-01-13T10:30:00Z' } } },
    { filter: { dateTimeField: { gt: '2025-01-01T00:00:00Z' } } },
    { filter: { dateTimeField: { gte: '2025-01-01T00:00:00Z' } } },
    { filter: { dateTimeField: { lt: '2025-12-31T23:59:59Z' } } },
    { filter: { dateTimeField: { lte: '2025-12-31T23:59:59Z' } } },
    {
      filter: {
        dateTimeField: {
          in: ['2025-01-01T00:00:00Z', '2025-01-02T00:00:00Z'],
        },
      },
    },
    { filter: { dateTimeField: { is: 'NULL' } } },
    { filter: { dateTimeField: { is: 'NOT_NULL' } } },
    { filter: { dateTimeField: { eq: null } } },
  ],
  [FieldMetadataType.SELECT]: [
    { filter: { selectField: { eq: 'OPTION_1' } } },
    { filter: { selectField: { neq: 'OPTION_1' } } },
    { filter: { selectField: { in: ['OPTION_1', 'OPTION_2'] } } },
    { filter: { selectField: { is: 'NULL' } } },
    { filter: { selectField: { is: 'NOT_NULL' } } },
  ],
  [FieldMetadataType.RATING]: [
    { filter: { ratingField: { eq: 'RATING_1' } } },
    { filter: { ratingField: { neq: 'RATING_1' } } },
    { filter: { ratingField: { in: ['RATING_1', 'RATING_2'] } } },
    { filter: { ratingField: { is: 'NULL' } } },
    { filter: { ratingField: { is: 'NOT_NULL' } } },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    { filter: { multiSelectField: { containsAny: ['OPTION_1'] } } },
    { filter: { multiSelectField: { is: 'NULL' } } },
    { filter: { multiSelectField: { is: 'NOT_NULL' } } },
    { filter: { multiSelectField: { isEmptyArray: true } } },
  ],
  [FieldMetadataType.ARRAY]: [
    { filter: { arrayField: { containsIlike: '%test%' } } },
    { filter: { arrayField: { is: 'NULL' } } },
    { filter: { arrayField: { is: 'NOT_NULL' } } },
    { filter: { arrayField: { isEmptyArray: true } } },
  ],
  [FieldMetadataType.RAW_JSON]: [
    { filter: { rawJsonField: { is: 'NULL' } } },
    { filter: { rawJsonField: { is: 'NOT_NULL' } } },
    { filter: { rawJsonField: { like: '%test%' } } },
  ],
  [FieldMetadataType.RELATION]: [
    { filter: { manyToOneRelationFieldId: { eq: TEST_UUID } } },
    { filter: { manyToOneRelationFieldId: { neq: TEST_UUID } } },
    { filter: { manyToOneRelationFieldId: { in: [TEST_UUID] } } },
    { filter: { manyToOneRelationFieldId: { is: 'NULL' } } },
    { filter: { manyToOneRelationFieldId: { is: 'NOT_NULL' } } },
    { filter: { manyToOneRelationFieldId: { eq: null } } },
  ],
  [FieldMetadataType.MORPH_RELATION]: [
    {
      filter: {
        [joinColumnNameForManyToOneMorphRelationField1]: { eq: TEST_UUID },
      },
    },
    {
      filter: {
        [joinColumnNameForManyToOneMorphRelationField1]: { neq: TEST_UUID },
      },
    },
    {
      filter: {
        [joinColumnNameForManyToOneMorphRelationField1]: { in: [TEST_UUID] },
      },
    },
    {
      filter: {
        [joinColumnNameForManyToOneMorphRelationField1]: { is: 'NULL' },
      },
    },
    {
      filter: {
        [joinColumnNameForManyToOneMorphRelationField1]: { is: 'NOT_NULL' },
      },
    },
  ],
  [FieldMetadataType.POSITION]: [
    { filter: { position: { eq: 1 } } },
    { filter: { position: { neq: 1 } } },
    { filter: { position: { gt: 0 } } },
    { filter: { position: { gte: 0 } } },
    { filter: { position: { lt: 10 } } },
    { filter: { position: { lte: 10 } } },
    { filter: { position: { in: [1, 2, 3] } } },
    { filter: { position: { is: 'NULL' } } },
    { filter: { position: { is: 'NOT_NULL' } } },
    {
      filter: { position: { eq: '1' } },
      expected: { position: { eq: 1 } },
    },
  ],
  [FieldMetadataType.FILES]: [
    { filter: { filesField: { is: 'NULL' } } },
    { filter: { filesField: { is: 'NOT_NULL' } } },
    { filter: { filesField: { like: '%test%' } } },
  ],
  [FieldMetadataType.RICH_TEXT_V2]: [
    { filter: { richTextV2Field: { markdown: { ilike: '%test%' } } } },
  ],
  [FieldMetadataType.ADDRESS]: [
    { filter: { addressField: { addressCity: { eq: 'Paris' } } } },
    { filter: { addressField: { addressCity: { like: '%Paris%' } } } },
    { filter: { addressField: { addressLat: { gt: 48.0 } } } },
    { filter: { addressField: { addressStreet1: { is: 'NULL' } } } },
  ],
  [FieldMetadataType.CURRENCY]: [
    { filter: { currencyField: { amountMicros: { eq: 1000000 } } } },
    { filter: { currencyField: { amountMicros: { gt: 0 } } } },
    { filter: { currencyField: { currencyCode: { eq: 'USD' } } } },
    { filter: { currencyField: { currencyCode: { is: 'NULL' } } } },
  ],
  [FieldMetadataType.EMAILS]: [
    { filter: { emailsField: { primaryEmail: { eq: 'test@test.com' } } } },
    { filter: { emailsField: { primaryEmail: { like: '%@test.com' } } } },
    { filter: { emailsField: { primaryEmail: { is: 'NULL' } } } },
  ],
  [FieldMetadataType.PHONES]: [
    { filter: { phonesField: { primaryPhoneNumber: { eq: '1234567890' } } } },
    {
      filter: { phonesField: { primaryPhoneNumber: { like: '%123%' } } },
    },
    { filter: { phonesField: { primaryPhoneCountryCode: { eq: 'FR' } } } },
    { filter: { phonesField: { primaryPhoneNumber: { is: 'NULL' } } } },
  ],
  [FieldMetadataType.FULL_NAME]: [
    { filter: { fullNameField: { firstName: { eq: 'John' } } } },
    { filter: { fullNameField: { lastName: { like: '%Doe%' } } } },
    { filter: { fullNameField: { firstName: { is: 'NULL' } } } },
  ],
  [FieldMetadataType.LINKS]: [
    { filter: { linksField: { primaryLinkUrl: { eq: 'https://test.com' } } } },
    { filter: { linksField: { primaryLinkLabel: { like: '%test%' } } } },
    { filter: { linksField: { primaryLinkUrl: { is: 'NULL' } } } },
  ],
  [FieldMetadataType.ACTOR]: [
    { filter: { actorField: { source: { eq: 'MANUAL' } } } },
    { filter: { actorField: { name: { like: '%John%' } } } },
    { filter: { actorField: { workspaceMemberId: { eq: TEST_UUID } } } },
    { filter: { actorField: { workspaceMemberId: { is: 'NULL' } } } },
  ],
};
