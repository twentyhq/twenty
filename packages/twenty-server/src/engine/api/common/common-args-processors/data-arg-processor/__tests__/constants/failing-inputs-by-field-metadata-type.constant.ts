import { joinColumnNameForManyToOneMorphRelationField1 } from 'test/integration/graphql/suites/inputs-validation/utils/setup-test-objects-with-all-field-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

export const failingInputsByFieldMetadataType: {
  [K in FieldMetadataType]?: {
    input: Record<string, unknown>;
  }[];
} = {
  [FieldMetadataType.TEXT]: [
    { input: { textField: {} } },
    { input: { textField: [] } },
    { input: { textField: true } },
    { input: { textField: 1 } },
  ],
  [FieldMetadataType.NUMBER]: [
    { input: { numberField: {} } },
    { input: { numberField: [] } },
    { input: { numberField: true } },
    { input: { numberField: 'string' } },
  ],
  [FieldMetadataType.UUID]: [
    { input: { uuidField: {} } },
    { input: { uuidField: [] } },
    { input: { uuidField: true } },
    { input: { uuidField: 1 } },
    { input: { uuidField: 'non-uuid' } },
  ],
  [FieldMetadataType.SELECT]: [
    { input: { selectField: 'not-a-select-option' } },
    { input: { selectField: {} } },
    { input: { selectField: [] } },
    { input: { selectField: true } },
    { input: { selectField: 1 } },
  ],
  [FieldMetadataType.RELATION]: [
    { input: { manyToOneRelationFieldId: {} } },
    { input: { manyToOneRelationFieldId: [] } },
    { input: { manyToOneRelationFieldId: true } },
    { input: { manyToOneRelationFieldId: 1 } },
    { input: { manyToOneRelationFieldId: 'non-uuid' } },
  ],
  [FieldMetadataType.RAW_JSON]: [{ input: { rawJsonField: 'not-a-json' } }],
  [FieldMetadataType.ARRAY]: [
    { input: { arrayField: true } },
    { input: { arrayField: 1 } },
  ],
  [FieldMetadataType.MORPH_RELATION]: [
    {
      input: {
        [joinColumnNameForManyToOneMorphRelationField1]: 'not-a-morph-relation',
      },
    },
    { input: { [joinColumnNameForManyToOneMorphRelationField1]: {} } },
    { input: { [joinColumnNameForManyToOneMorphRelationField1]: [] } },
    { input: { [joinColumnNameForManyToOneMorphRelationField1]: true } },
    { input: { [joinColumnNameForManyToOneMorphRelationField1]: 1 } },
  ],
  [FieldMetadataType.RATING]: [
    { input: { ratingField: 'not-a-rating' } },
    { input: { ratingField: {} } },
    { input: { ratingField: [] } },
    { input: { ratingField: true } },
    { input: { ratingField: 1 } },
  ],
  [FieldMetadataType.MULTI_SELECT]: [
    { input: { multiSelectField: 'not-a-select-option' } },
    { input: { multiSelectField: {} } },
    { input: { multiSelectField: true } },
    { input: { multiSelectField: 1 } },
  ],
  [FieldMetadataType.DATE]: [
    { input: { dateField: 'malformed-date' } },
    { input: { dateField: {} } },
    { input: { dateField: [] } },
    { input: { dateField: true } },
    { input: { dateField: 1 } },
    { input: { dateField: '2024' } },
    { input: { dateField: '2024-01' } },
    { input: { dateField: '2024-13-01' } },
    { input: { dateField: '2024-02-31' } },
  ],
  [FieldMetadataType.DATE_TIME]: [
    { input: { dateTimeField: 'malformed-date' } },
    { input: { dateTimeField: {} } },
    { input: { dateTimeField: [] } },
    { input: { dateTimeField: true } },
    { input: { dateTimeField: 1 } },
    { input: { dateTimeField: '2024' } },
    { input: { dateTimeField: '2024-01' } },
    { input: { dateTimeField: '2024-13-01T10:30:00Z' } },
    { input: { dateTimeField: '2024-01-15T25:30:00Z' } },
  ],
  [FieldMetadataType.BOOLEAN]: [
    { input: { booleanField: {} } },
    { input: { booleanField: [] } },
    { input: { booleanField: 'string' } },
    { input: { booleanField: 1 } },
  ],
  [FieldMetadataType.RICH_TEXT]: [{ input: { richTextField: 'test' } }],
  [FieldMetadataType.ADDRESS]: [
    { input: { addressField: 'not-an-address' } },
    { input: { addressField: 1 } },
    { input: { addressField: true } },
  ],
  [FieldMetadataType.CURRENCY]: [
    { input: { currencyField: 'not-a-currency' } },
    { input: { currencyField: 1 } },
    { input: { currencyField: true } },
  ],
  [FieldMetadataType.EMAILS]: [
    { input: { emailsField: 'not-an-email' } },
    { input: { emailsField: { primaryEmail: 'not-an-email' } } },
    { input: { emailsField: { additionalEmails: 'not-an-email' } } },
    { input: { emailsField: { additionalEmails: ['not-an-email'] } } },
    {
      input: {
        emailsField: {
          primaryEmail: 'email@email.com',
          additionalEmails: ['not-an-email'],
        },
      },
    },
    {
      input: {
        emailsField: {
          primaryEmail: 'not-an-email',
          additionalEmails: ['additional@email.com'],
        },
      },
    },
    {
      input: {
        emailsField: {
          additionalEmails: ['not-an-email', 'additional@email.com'],
        },
      },
    },
  ],
  [FieldMetadataType.PHONES]: [
    { input: { phonesField: 'not-a-phone' } },
    { input: { phonesField: 1 } },
    { input: { phonesField: true } },
  ],
  [FieldMetadataType.FULL_NAME]: [
    { input: { fullNameField: 'not-a-full-name' } },
    { input: { fullNameField: 1 } },
    { input: { fullNameField: true } },
  ],
  [FieldMetadataType.LINKS]: [
    { input: { linksField: 'not-a-link' } },
    { input: { linksField: 1 } },
    { input: { linksField: true } },
  ],
  [FieldMetadataType.RICH_TEXT_V2]: [
    { input: { richTextV2Field: 'not-a-rich-text' } },
    { input: { richTextV2Field: 1 } },
    { input: { richTextV2Field: true } },
  ],
  [FieldMetadataType.POSITION]: [
    { input: { position: 'not-a-position' } },
    { input: { position: NaN } },
    { input: { position: {} } },
    { input: { position: [] } },
  ],
  [FieldMetadataType.FILES]: [
    { input: { filesField: 'not-an-addFiles-property' } },
    { input: { filesField: { addFiles: [{ invalidField: 'test' }] } } },
    {
      input: {
        filesField: { addFiles: [{ fileId: 'not-a-uuid', label: 'Doc.pdf' }] },
      },
    },
    {
      input: {
        filesField: [
          {
            addFiles: [
              { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 12345 },
            ],
          },
        ],
      },
    },
    {
      input: {
        filesField: {
          addFiles: [
            {
              fileId: '550e8400-e29b-41d4-a716-446655440000',
              label: 'Document.pdf',
              extension: 'not-allowed-in-input',
            },
          ],
        },
      },
    },
  ],
  [FieldMetadataType.NUMERIC]: [
    { input: { numericField: {} } },
    { input: { numericField: 'not-a-number' } },
  ],
};
