import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { buildRecordFromImportedStructuredRow } from '@/object-record/spreadsheet-import/utils/buildRecordFromImportedStructuredRow';
import {
  type ImportedStructuredRow,
  type SpreadsheetImportField,
} from '@/spreadsheet-import/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { RelationType } from '~/generated/graphql';

describe('buildRecordFromImportedStructuredRow', () => {
  const fields: FieldMetadataItem[] = [
    {
      id: '3',
      name: 'booleanField',
      label: 'Boolean Field',
      type: FieldMetadataType.BOOLEAN,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconCheck',
      description: null,
    },
    {
      id: '4',
      name: 'numberField',
      label: 'Number Field',
      type: FieldMetadataType.NUMBER,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconNumber',
      description: null,
    },
    {
      id: '5',
      name: 'multiSelectField',
      label: 'Multi-Select Field',
      type: FieldMetadataType.MULTI_SELECT,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconTag',
      description: null,
      options: [
        {
          id: '1',
          value: 'tag1',
          label: 'Tag 1',
          color: 'blue',
          position: 0,
        },
        {
          id: '2',
          value: 'tag2',
          label: 'Tag 2',
          color: 'red',
          position: 1,
        },
        {
          id: '3',
          value: 'tag3',
          label: 'Tag 3',
          color: 'green',
          position: 2,
        },
      ],
    },
    {
      id: '6',
      name: 'relationField',
      label: 'Relation Field',
      type: FieldMetadataType.RELATION,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconBuilding',
      description: null,
      relation: {
        type: RelationType.MANY_TO_ONE,
      } as FieldMetadataItemRelation,
    },
    {
      id: '7',
      name: 'fullNameField',
      label: 'Full Name Field',
      type: FieldMetadataType.FULL_NAME,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconUser',
      description: null,
    },
    {
      id: '8',
      name: 'currencyField',
      label: 'Currency Field',
      type: FieldMetadataType.CURRENCY,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconCurrencyDollar',
      description: null,
    },
    {
      id: '9',
      name: 'addressField',
      label: 'Address Field',
      type: FieldMetadataType.ADDRESS,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconMap',
      description: null,
    },
    {
      id: '10',
      name: 'selectField',
      label: 'Select Field',
      type: FieldMetadataType.SELECT,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconTag',
      description: null,
      options: [
        {
          id: '1',
          value: 'option1',
          label: 'Option 1',
          color: 'blue',
          position: 0,
        },
        {
          id: '2',
          value: 'option2',
          label: 'Option 2',
          color: 'red',
          position: 1,
        },
      ],
    },
    {
      id: '11',
      name: 'arrayField',
      label: 'Array Field',
      type: FieldMetadataType.ARRAY,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconBracketsContain',
      description: null,
    },
    {
      id: '12',
      name: 'jsonField',
      label: 'JSON Field',
      type: FieldMetadataType.RAW_JSON,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconBraces',
      description: null,
    },
    {
      id: '13',
      name: 'phoneField',
      label: 'Phone Field',
      type: FieldMetadataType.PHONES,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconPhone',
      description: null,
    },
    {
      id: '14',
      name: 'linksField',
      label: 'Links Field',
      type: FieldMetadataType.LINKS,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconWorld',
      description: null,
    },
    {
      id: '15',
      name: 'createdBy',
      label: 'Created by',
      type: FieldMetadataType.ACTOR,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconUsers',
      description: null,
    },
    {
      id: '16',
      name: 'richTextField',
      label: 'Rich Text Field',
      type: FieldMetadataType.RICH_TEXT_V2,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconTextEditor',
      description: null,
    },
    {
      id: '17',
      name: 'dateField',
      label: 'Date Field',
      type: FieldMetadataType.DATE,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconCalendarEvent',
      description: null,
    },
    {
      id: '18',
      name: 'dateTimeField',
      label: 'Date Time Field',
      type: FieldMetadataType.DATE_TIME,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconCalendarClock',
      description: null,
    },
    {
      id: '19',
      name: 'ratingField',
      label: 'Rating Field',
      type: FieldMetadataType.RATING,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconStar',
      description: null,
    },
    {
      id: '20',
      name: 'emailField',
      label: 'Email Field',
      type: FieldMetadataType.EMAILS,
      isNullable: true,
      isActive: true,
      isCustom: false,
      isSystem: false,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      icon: 'IconMail',
      description: null,
    },
  ];
  it('should successfully build a record from imported structured row', () => {
    const importedStructuredRow: ImportedStructuredRow = {
      booleanField: 'true',
      numberField: '30',
      multiSelectField: '["tag1", "tag2", "tag3"]',
      'nameField (relationField)': 'John Doe',
      selectField: 'option1',
      arrayField: '["item1", "item2", "item3"]',
      jsonField: '{"key": "value", "nested": {"prop": "data"}}',
      richTextField: 'Some rich text content',
      dateField: '2023-12-25',
      dateTimeField: '2023-12-25T10:30:00Z',
      ratingField: '4',
      'BlockNote (richTextField)': 'Rich content in blocknote format',
      'Markdown (richTextField)': 'Content in markdown format',
      'First Name (fullNameField)': 'John',
      'Last Name (fullNameField)': 'Doe',
      'Amount (currencyField)': '75',
      'Currency (currencyField)': 'USD',
      'Address 1 (addressField)': '123 Main St',
      'Address 2 (addressField)': 'Apt 4B',
      'City (addressField)': 'New York',
      'Post Code (addressField)': '10001',
      'State (addressField)': 'NY',
      'Country (addressField)': 'USA',
      'Primary Email (emailField)': 'john.doe@example.com',
      'Additional Emails (emailField)':
        '["john.doe+work@example.com", "j.doe@company.com"]',
      'Primary Phone Number (phoneField)': '+1-555-0123',
      'Primary Phone Country Code (phoneField)': 'US',
      'Primary Phone Calling Code (phoneField)': '+1',
      'Additional Phones (phoneField)':
        '[{"number": "+1-555-0124", "callingCode": "+1", "countryCode": "US"}]',
      'Link URL (linksField)': 'https://example.com',
      'Link Label (linksField)': 'Example Website',
      'Secondary Links (linksField)':
        '[{"url": "https://github.com/user", "label": "GitHub"}]',
    };

    const spreadsheetImportFields = [
      {
        fieldMetadataItemId: '6',
        isNestedField: false,
        isRelationConnectField: true,
        label: 'Relation Field / Name Field',
        key: 'nameField (relationField)',
        fieldMetadataType: FieldMetadataType.RELATION,
        uniqueFieldMetadataItem: {
          name: 'nameField',
          type: FieldMetadataType.TEXT,
        },
      },
    ] as SpreadsheetImportField[];

    const result = buildRecordFromImportedStructuredRow({
      importedStructuredRow,
      fieldMetadataItems: fields,
      spreadsheetImportFields,
    });

    expect(result).toEqual({
      emailField: {
        primaryEmail: 'john.doe@example.com',
        additionalEmails: ['john.doe+work@example.com', 'j.doe@company.com'],
      },
      booleanField: true,
      numberField: 30,
      multiSelectField: ['tag1', 'tag2', 'tag3'],
      relationField: {
        connect: {
          where: {
            nameField: 'John Doe',
          },
        },
      },
      selectField: 'option1',
      arrayField: ['item1', 'item2', 'item3'],
      jsonField: { key: 'value', nested: { prop: 'data' } },
      fullNameField: {
        firstName: 'John',
        lastName: 'Doe',
      },
      currencyField: {
        amountMicros: 75000000,
        currencyCode: 'USD',
      },
      addressField: {
        addressStreet1: '123 Main St',
        addressStreet2: 'Apt 4B',
        addressCity: 'New York',
        addressPostcode: '10001',
        addressState: 'NY',
        addressCountry: 'USA',
      },
      createdBy: {
        source: 'IMPORT',
        context: {},
      },
      phoneField: {
        primaryPhoneNumber: '+1-555-0123',
        primaryPhoneCountryCode: 'US',
        primaryPhoneCallingCode: '+1',
        additionalPhones: [
          {
            number: '+1-555-0124',
            callingCode: '+1',
            countryCode: 'US',
          },
        ],
      },
      linksField: {
        primaryLinkUrl: 'https://example.com',
        primaryLinkLabel: 'Example Website',
        secondaryLinks: [
          {
            url: 'https://github.com/user',
            label: 'GitHub',
          },
        ],
      },
      richTextField: {
        blocknote: 'Rich content in blocknote format',
        markdown: 'Content in markdown format',
      },
      dateField: '2023-12-25',
      dateTimeField: '2023-12-25T10:30:00Z',
      ratingField: '4',
    });
  });

  it('should successfully build a record from imported structured row with primary phone number (without calling code)', () => {
    const importedStructuredRow: ImportedStructuredRow = {
      'Primary Phone Number (phoneField)': '5550123',
    };

    const result = buildRecordFromImportedStructuredRow({
      importedStructuredRow,
      fieldMetadataItems: fields,
      spreadsheetImportFields: [],
    });

    expect(result).toEqual({
      phoneField: {
        primaryPhoneNumber: '5550123',
        primaryPhoneCallingCode: '+1',
      },
      createdBy: {
        source: 'IMPORT',
        context: {},
      },
    });
  });

  it('should successfully build a record from imported structured row with relation composite subfield', () => {
    const importedStructuredRow: ImportedStructuredRow = {
      'emailField (relationField)': 'john.doe@example.com',
    };

    const spreadsheetImportFields = [
      {
        fieldMetadataItemId: '6',
        isNestedField: false,
        isRelationConnectField: true,
        label: 'Relation Field / Email Field',
        key: 'emailField (relationField)',
        fieldMetadataType: FieldMetadataType.RELATION,
        uniqueFieldMetadataItem: {
          name: 'emailField',
          type: FieldMetadataType.EMAILS,
        },
        compositeSubFieldKey: 'primaryEmail',
      },
    ] as SpreadsheetImportField[];

    const result = buildRecordFromImportedStructuredRow({
      importedStructuredRow,
      fieldMetadataItems: fields,
      spreadsheetImportFields,
    });

    expect(result).toEqual({
      relationField: {
        connect: {
          where: {
            emailField: {
              primaryEmail: 'john.doe@example.com',
            },
          },
        },
      },
      createdBy: {
        source: 'IMPORT',
        context: {},
      },
    });
  });

  it('should return empty record for empty imported row', () => {
    const importedStructuredRow: ImportedStructuredRow = {};

    const spreadsheetImportFields = [
      {
        fieldMetadataItemId: '6',
        isNestedField: false,
        isRelationConnectField: true,
        label: 'Relation Field / Name Field',
        key: 'nameField (relationField)',
        fieldMetadataType: FieldMetadataType.RELATION,
        uniqueFieldMetadataItem: {
          name: 'nameField',
          type: FieldMetadataType.TEXT,
        },
      },
    ] as SpreadsheetImportField[];

    const result = buildRecordFromImportedStructuredRow({
      importedStructuredRow,
      fieldMetadataItems: fields,
      spreadsheetImportFields,
    });

    expect(result).toEqual({
      createdBy: {
        source: 'IMPORT',
        context: {},
      },
    });
  });
});
