import { joinColumnNameForManyToOneMorphRelationField1 } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

const TEST_UUID = '20202020-b21e-4ec2-873b-de4264d89021';

export const successfulInputsByFieldMetadataType: {
  [K in FieldMetadataType]?: {
    input: Record<string, unknown>;
    expectedOutput: Record<string, unknown>;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    { input: { textField: 'test' }, expectedOutput: { textField: 'test' } },
    { input: { textField: '' }, expectedOutput: { textField: null } },
    { input: { textField: null }, expectedOutput: { textField: null } },
  ],
  [FieldMetadataType.NUMBER]: [
    { input: { numberField: 1 }, expectedOutput: { numberField: 1 } },
    { input: { numberField: null }, expectedOutput: { numberField: null } },
    { input: { numberField: 0 }, expectedOutput: { numberField: 0 } },
    { input: { numberField: -1.1 }, expectedOutput: { numberField: -1.1 } },
  ],
  [FieldMetadataType.UUID]: [
    {
      input: { uuidField: TEST_UUID },
      expectedOutput: { uuidField: TEST_UUID },
    },
    { input: { uuidField: null }, expectedOutput: { uuidField: null } },
  ],
  [FieldMetadataType.SELECT]: [
    {
      input: { selectField: 'OPTION_1' },
      expectedOutput: { selectField: 'OPTION_1' },
    },
    { input: { selectField: null }, expectedOutput: { selectField: null } },
  ],
  [FieldMetadataType.RELATION]: [
    {
      input: { manyToOneRelationFieldId: TEST_UUID },
      expectedOutput: { manyToOneRelationFieldId: TEST_UUID },
    },
    {
      input: { manyToOneRelationFieldId: null },
      expectedOutput: { manyToOneRelationFieldId: null },
    },
  ],
  [FieldMetadataType.MORPH_RELATION]: [
    {
      input: { [joinColumnNameForManyToOneMorphRelationField1]: TEST_UUID },
      expectedOutput: {
        [joinColumnNameForManyToOneMorphRelationField1]: TEST_UUID,
      },
    },
    {
      input: { [joinColumnNameForManyToOneMorphRelationField1]: null },
      expectedOutput: { [joinColumnNameForManyToOneMorphRelationField1]: null },
    },
  ],
  [FieldMetadataType.RAW_JSON]: [
    {
      input: { rawJsonField: { key: 'value' } },
      expectedOutput: { rawJsonField: { key: 'value' } },
    },
    { input: { rawJsonField: {} }, expectedOutput: { rawJsonField: null } },
    { input: { rawJsonField: null }, expectedOutput: { rawJsonField: null } },
    {
      input: { rawJsonField: '{"key": "value"}' },
      expectedOutput: { rawJsonField: '{"key": "value"}' },
    },
  ],
  [FieldMetadataType.ARRAY]: [
    {
      input: { arrayField: ['item1', 'item2'] },
      expectedOutput: { arrayField: ['item1', 'item2'] },
    },
    {
      input: { arrayField: 'item1' },
      expectedOutput: { arrayField: ['item1'] },
    },
    { input: { arrayField: [] }, expectedOutput: { arrayField: null } },
    { input: { arrayField: null }, expectedOutput: { arrayField: null } },
  ],
  [FieldMetadataType.RATING]: [
    {
      input: { ratingField: 'RATING_2' },
      expectedOutput: { ratingField: 'RATING_2' },
    },
    { input: { ratingField: null }, expectedOutput: { ratingField: null } },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    {
      input: { multiSelectField: ['OPTION_1'] },
      expectedOutput: { multiSelectField: ['OPTION_1'] },
    },
    {
      input: { multiSelectField: [] },
      expectedOutput: { multiSelectField: null },
    },
    {
      input: { multiSelectField: null },
      expectedOutput: { multiSelectField: null },
    },
  ],
  [FieldMetadataType.DATE]: [
    { input: { dateField: null }, expectedOutput: { dateField: null } },
    {
      input: { dateField: '2025-01-13' },
      expectedOutput: { dateField: '2025-01-13' },
    },
    {
      input: { dateField: '20250113' },
      expectedOutput: { dateField: '20250113' },
    },
    {
      input: { dateField: '2025.01.13' },
      expectedOutput: { dateField: '2025.01.13' },
    },
    {
      input: { dateField: '2025/01/13' },
      expectedOutput: { dateField: '2025/01/13' },
    },
    {
      input: { dateField: '01-13-2025' },
      expectedOutput: { dateField: '01-13-2025' },
    },
    {
      input: { dateField: '01/13/2025' },
      expectedOutput: { dateField: '01/13/2025' },
    },
    {
      input: { dateField: '01.13.2025' },
      expectedOutput: { dateField: '01.13.2025' },
    },
    {
      input: { dateField: 'January 13, 2025' },
      expectedOutput: { dateField: 'January 13, 2025' },
    },
    {
      input: { dateField: 'Jan 13, 2025' },
      expectedOutput: { dateField: 'Jan 13, 2025' },
    },
    {
      input: { dateField: '13 January 2025' },
      expectedOutput: { dateField: '13 January 2025' },
    },
    {
      input: { dateField: '13 Jan 2025' },
      expectedOutput: { dateField: '13 Jan 2025' },
    },
    {
      input: { dateField: '13-Jan-2025' },
      expectedOutput: { dateField: '13-Jan-2025' },
    },
    {
      input: { dateField: '2025-Jan-13' },
      expectedOutput: { dateField: '2025-Jan-13' },
    },
    {
      input: { dateField: '2025-01-13T10:30:00.000Z' },
      expectedOutput: { dateField: '2025-01-13T10:30:00.000Z' },
    },
    {
      input: { dateField: '2025-01-13T10:30:00Z' },
      expectedOutput: { dateField: '2025-01-13T10:30:00Z' },
    },
    {
      input: { dateField: '2025-01-13T10:30:00.000' },
      expectedOutput: { dateField: '2025-01-13T10:30:00.000' },
    },
    {
      input: { dateField: '2025-01-13T10:30:00' },
      expectedOutput: { dateField: '2025-01-13T10:30:00' },
    },
    {
      input: { dateField: '2025-01-13 10:30:00' },
      expectedOutput: { dateField: '2025-01-13 10:30:00' },
    },
    {
      input: { dateField: '2025-01-13 10:30:00.000' },
      expectedOutput: { dateField: '2025-01-13 10:30:00.000' },
    },
  ],
  [FieldMetadataType.DATE_TIME]: [
    { input: { dateTimeField: null }, expectedOutput: { dateTimeField: null } },
    {
      input: { dateTimeField: '2025-01-13T10:30:00.000Z' },
      expectedOutput: { dateTimeField: '2025-01-13T10:30:00.000Z' },
    },
    {
      input: { dateTimeField: '2025-01-13T10:30:00Z' },
      expectedOutput: { dateTimeField: '2025-01-13T10:30:00Z' },
    },
    {
      input: { dateTimeField: '2025-01-13T10:30:00.000+02:00' },
      expectedOutput: { dateTimeField: '2025-01-13T10:30:00.000+02:00' },
    },
    {
      input: { dateTimeField: '2025-01-13T10:30:00+02:00' },
      expectedOutput: { dateTimeField: '2025-01-13T10:30:00+02:00' },
    },
    {
      input: { dateTimeField: '2025-01-13T10:30:00.000' },
      expectedOutput: { dateTimeField: '2025-01-13T10:30:00.000' },
    },
    {
      input: { dateTimeField: '2025-01-13T10:30:00' },
      expectedOutput: { dateTimeField: '2025-01-13T10:30:00' },
    },
    {
      input: { dateTimeField: '2025-01-13 10:30:00.000' },
      expectedOutput: { dateTimeField: '2025-01-13 10:30:00.000' },
    },
    {
      input: { dateTimeField: '2025-01-13 10:30:00' },
      expectedOutput: { dateTimeField: '2025-01-13 10:30:00' },
    },
    {
      input: { dateTimeField: '2025-01-13 10:30' },
      expectedOutput: { dateTimeField: '2025-01-13 10:30' },
    },
    {
      input: { dateTimeField: '2025-01-13' },
      expectedOutput: { dateTimeField: '2025-01-13' },
    },
    {
      input: { dateTimeField: '20250113' },
      expectedOutput: { dateTimeField: '20250113' },
    },
    {
      input: { dateTimeField: '2025.01.13' },
      expectedOutput: { dateTimeField: '2025.01.13' },
    },
    {
      input: { dateTimeField: '2025/01/13' },
      expectedOutput: { dateTimeField: '2025/01/13' },
    },
    {
      input: { dateTimeField: '01-13-2025' },
      expectedOutput: { dateTimeField: '01-13-2025' },
    },
    {
      input: { dateTimeField: '01/13/2025' },
      expectedOutput: { dateTimeField: '01/13/2025' },
    },
    {
      input: { dateTimeField: '01.13.2025' },
      expectedOutput: { dateTimeField: '01.13.2025' },
    },
    {
      input: { dateTimeField: 'January 13, 2025' },
      expectedOutput: { dateTimeField: 'January 13, 2025' },
    },
    {
      input: { dateTimeField: 'Jan 13, 2025' },
      expectedOutput: { dateTimeField: 'Jan 13, 2025' },
    },
    {
      input: { dateTimeField: '13 January 2025' },
      expectedOutput: { dateTimeField: '13 January 2025' },
    },
    {
      input: { dateTimeField: '13 Jan 2025' },
      expectedOutput: { dateTimeField: '13 Jan 2025' },
    },
    {
      input: { dateTimeField: '13-Jan-2025' },
      expectedOutput: { dateTimeField: '13-Jan-2025' },
    },
    {
      input: { dateTimeField: '2025-Jan-13' },
      expectedOutput: { dateTimeField: '2025-Jan-13' },
    },
  ],
  [FieldMetadataType.BOOLEAN]: [
    { input: { booleanField: true }, expectedOutput: { booleanField: true } },
    { input: { booleanField: false }, expectedOutput: { booleanField: false } },
    { input: { booleanField: null }, expectedOutput: { booleanField: null } },
  ],
  [FieldMetadataType.ADDRESS]: [
    {
      input: {
        addressField: {
          addressPostcode: 'postcode',
          addressStreet1: 'street 1',
          addressStreet2: 'street 2',
          addressCity: 'city',
          addressState: 'state',
          addressCountry: 'country',
        },
      },
      expectedOutput: {
        addressField: {
          addressPostcode: 'postcode',
          addressStreet1: 'street 1',
          addressStreet2: 'street 2',
          addressCity: 'city',
          addressState: 'state',
          addressCountry: 'country',
          addressLat: undefined,
          addressLng: undefined,
        },
      },
    },
    { input: { addressField: null }, expectedOutput: { addressField: null } },
  ],
  [FieldMetadataType.CURRENCY]: [
    {
      input: { currencyField: { amountMicros: 1000000, currencyCode: 'USD' } },
      expectedOutput: {
        currencyField: { amountMicros: 1000000, currencyCode: 'USD' },
      },
    },
    { input: { currencyField: null }, expectedOutput: { currencyField: null } },
  ],
  [FieldMetadataType.EMAILS]: [
    {
      input: {
        emailsField: {
          primaryEmail: 'test@test.com',
          additionalEmails: ['test2@test.com'],
        },
      },
      expectedOutput: {
        emailsField: {
          primaryEmail: 'test@test.com',
          additionalEmails: '["test2@test.com"]',
        },
      },
    },
    { input: { emailsField: null }, expectedOutput: { emailsField: null } },
  ],
  [FieldMetadataType.PHONES]: [
    {
      input: {
        phonesField: {
          primaryPhoneNumber: '1234567890',
          primaryPhoneCountryCode: 'FR',
          primaryPhoneCallingCode: '+33',
          additionalPhones: [
            { number: '1234567890', callingCode: '+33', countryCode: 'FR' },
          ],
        },
      },
      expectedOutput: {
        phonesField: {
          primaryPhoneNumber: '1234567890',
          primaryPhoneCountryCode: 'FR',
          primaryPhoneCallingCode: '+33',
          additionalPhones:
            '[{"countryCode":"FR","callingCode":"+33","number":"1234567890"}]',
        },
      },
    },
    { input: { phonesField: null }, expectedOutput: { phonesField: null } },
  ],
  [FieldMetadataType.FULL_NAME]: [
    {
      input: { fullNameField: { firstName: 'John', lastName: 'Doe' } },
      expectedOutput: {
        fullNameField: { firstName: 'John', lastName: 'Doe' },
      },
    },
    { input: { fullNameField: null }, expectedOutput: { fullNameField: null } },
  ],
  [FieldMetadataType.LINKS]: [
    {
      input: {
        linksField: {
          primaryLinkUrl: 'https://twenty.com',
          primaryLinkLabel: 'Twenty',
          secondaryLinks: [{ url: 'twenty.com', label: 'Twenty' }],
        },
      },
      expectedOutput: {
        linksField: {
          primaryLinkUrl: 'https://twenty.com',
          primaryLinkLabel: 'Twenty',
          secondaryLinks: '[{"url":"twenty.com","label":"Twenty"}]',
        },
      },
    },
    { input: { linksField: null }, expectedOutput: { linksField: null } },
  ],
  [FieldMetadataType.RICH_TEXT_V2]: [
    {
      input: { richTextV2Field: { blocknote: 'test', markdown: 'test' } },
      expectedOutput: {
        richTextV2Field: { blocknote: 'test', markdown: 'test' },
      },
    },
    {
      input: { richTextV2Field: null },
      expectedOutput: { richTextV2Field: null },
    },
  ],
  [FieldMetadataType.POSITION]: [
    { input: { position: 1000 }, expectedOutput: { position: 1000 } },
    { input: { position: 0 }, expectedOutput: { position: 0 } },
    { input: { position: -100 }, expectedOutput: { position: -100 } },
  ],
  [FieldMetadataType.FILES]: [
    {
      input: {
        filesField: [
          { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 'Doc.pdf' },
        ],
      },
      expectedOutput: {
        filesField: [
          { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 'Doc.pdf' },
        ],
      },
    },
    { input: { filesField: [] }, expectedOutput: { filesField: null } },
    { input: { filesField: null }, expectedOutput: { filesField: null } },
  ],
  [FieldMetadataType.NUMERIC]: [
    {
      input: { numericField: '123.45' },
      expectedOutput: { numericField: 123.45 },
    },
    {
      input: { numericField: 123.45 },
      expectedOutput: { numericField: 123.45 },
    },
    { input: { numericField: null }, expectedOutput: { numericField: null } },
  ],
  [FieldMetadataType.ACTOR]: [
    {
      input: {
        actorField: {
          source: 'MANUAL',
          name: 'John Doe',
          workspaceMemberId: TEST_UUID,
        },
      },
      expectedOutput: {
        actorField: {
          source: 'MANUAL',
          name: 'John Doe',
          workspaceMemberId: TEST_UUID,
          context: undefined,
        },
      },
    },
    { input: { actorField: null }, expectedOutput: { actorField: null } },
  ],
};
