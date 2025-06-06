import { FieldMetadataType } from '~/generated-metadata/graphql';
import { buildFieldMetadata } from '../getBlob';

jest.mock(
  '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs',
  () => ({
    SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS: {
      [FieldMetadataType.FULL_NAME]: {
        subFields: ['firstName', 'lastName'],
      },
      [FieldMetadataType.ADDRESS]: {
        subFields: [
          'addressStreet1',
          'addressStreet2',
          'addressCity',
          'addressState',
          'addressCountry',
          'addressPostcode',
          'addressLat',
          'addressLng',
        ],
      },
      [FieldMetadataType.CURRENCY]: {
        subFields: ['amountMicros', 'currencyCode'],
      },
      [FieldMetadataType.PHONES]: {
        subFields: [
          'primaryPhoneNumber',
          'primaryPhoneCountryCode',
          'primaryPhoneCallingCode',
          'additionalPhones',
        ],
      },
      [FieldMetadataType.EMAILS]: {
        subFields: ['primaryEmail', 'additionalEmails'],
      },
      [FieldMetadataType.LINKS]: {
        subFields: ['primaryLinkUrl', 'primaryLinkLabel', 'secondaryLinks'],
      },
      [FieldMetadataType.ACTOR]: {
        subFields: ['source', 'name'],
      },
      [FieldMetadataType.RICH_TEXT_V2]: {
        subFields: ['blocknote', 'markdown'],
      },
    },
  }),
);

interface Field {
  name: string;
  type: string;
}

interface FieldMetadata {
  name: string;
  type: string;
  isComposite: boolean;
  subFields?: {
    name: string;
    type: string;
    fullName: string;
  }[];
}

describe('buildFieldMetadata', () => {
  it('should build metadata for simple fields', () => {
    const fields: Field[] = [
      { name: 'email', type: 'EMAIL' },
      { name: 'phone', type: 'PHONE' },
    ];

    const result = buildFieldMetadata(fields);

    expect(result).toEqual([
      { name: 'email', type: 'EMAIL', isComposite: false },
      { name: 'phone', type: 'PHONE', isComposite: false },
    ]);
  });

  it('should build metadata for composite fields', () => {
    const fields: Field[] = [
      { name: 'fullName', type: FieldMetadataType.FULL_NAME },
      { name: 'homeAddress', type: FieldMetadataType.ADDRESS },
    ];

    const result = buildFieldMetadata(fields);

    expect(result).toEqual([
      {
        name: 'fullName',
        type: FieldMetadataType.FULL_NAME,
        isComposite: true,
        subFields: [
          { name: 'firstName', type: 'TEXT', fullName: 'fullName.firstName' },
          { name: 'lastName', type: 'TEXT', fullName: 'fullName.lastName' },
        ],
      },
      {
        name: 'homeAddress',
        type: FieldMetadataType.ADDRESS,
        isComposite: true,
        subFields: [
          {
            name: 'addressStreet1',
            type: 'TEXT',
            fullName: 'homeAddress.addressStreet1',
          },
          {
            name: 'addressStreet2',
            type: 'TEXT',
            fullName: 'homeAddress.addressStreet2',
          },
          {
            name: 'addressCity',
            type: 'TEXT',
            fullName: 'homeAddress.addressCity',
          },
          {
            name: 'addressState',
            type: 'TEXT',
            fullName: 'homeAddress.addressState',
          },
          {
            name: 'addressCountry',
            type: 'TEXT',
            fullName: 'homeAddress.addressCountry',
          },
          {
            name: 'addressPostcode',
            type: 'TEXT',
            fullName: 'homeAddress.addressPostcode',
          },
          {
            name: 'addressLat',
            type: 'TEXT',
            fullName: 'homeAddress.addressLat',
          },
          {
            name: 'addressLng',
            type: 'TEXT',
            fullName: 'homeAddress.addressLng',
          },
        ],
      },
    ]);
  });

  it('should handle mixed simple and composite fields', () => {
    const fields: Field[] = [
      { name: 'email', type: 'EMAIL' },
      { name: 'fullName', type: FieldMetadataType.FULL_NAME },
      { name: 'description', type: 'TEXT' },
    ];

    const result = buildFieldMetadata(fields);

    expect(result).toHaveLength(3);
    expect(result[0].isComposite).toBe(false);
    expect(result[1].isComposite).toBe(true);
    expect(result[2].isComposite).toBe(false);
  });

  it('should handle currency composite fields with correct types', () => {
    const fields: Field[] = [
      { name: 'salary', type: FieldMetadataType.CURRENCY },
    ];

    const result = buildFieldMetadata(fields);

    expect(result[0]).toEqual({
      name: 'salary',
      type: FieldMetadataType.CURRENCY,
      isComposite: true,
      subFields: [
        // amountMicros maps to TEXT because getSubFieldType doesn't have exact mapping
        { name: 'amountMicros', type: 'TEXT', fullName: 'salary.amountMicros' },
        { name: 'currencyCode', type: 'TEXT', fullName: 'salary.currencyCode' },
      ],
    });
  });

  it('should handle phones composite fields', () => {
    const fields: Field[] = [
      { name: 'contactPhone', type: FieldMetadataType.PHONES },
    ];

    const result = buildFieldMetadata(fields);

    expect(result[0]).toEqual({
      name: 'contactPhone',
      type: FieldMetadataType.PHONES,
      isComposite: true,
      subFields: [
        {
          name: 'primaryPhoneNumber',
          type: 'TEXT',
          fullName: 'contactPhone.primaryPhoneNumber',
        },
        {
          name: 'primaryPhoneCountryCode',
          type: 'TEXT',
          fullName: 'contactPhone.primaryPhoneCountryCode',
        },
        {
          name: 'primaryPhoneCallingCode',
          type: 'TEXT',
          fullName: 'contactPhone.primaryPhoneCallingCode',
        },
        {
          name: 'additionalPhones',
          type: 'TEXT',
          fullName: 'contactPhone.additionalPhones',
        },
      ],
    });
  });

  it('should handle emails composite fields', () => {
    const fields: Field[] = [
      { name: 'contactEmails', type: FieldMetadataType.EMAILS },
    ];

    const result = buildFieldMetadata(fields);

    expect(result[0]).toEqual({
      name: 'contactEmails',
      type: FieldMetadataType.EMAILS,
      isComposite: true,
      subFields: [
        {
          name: 'primaryEmail',
          type: 'TEXT',
          fullName: 'contactEmails.primaryEmail',
        },
        {
          name: 'additionalEmails',
          type: 'TEXT',
          fullName: 'contactEmails.additionalEmails',
        },
      ],
    });
  });

  it('should handle links composite fields', () => {
    const fields: Field[] = [
      { name: 'websiteLinks', type: FieldMetadataType.LINKS },
    ];

    const result = buildFieldMetadata(fields);

    expect(result[0]).toEqual({
      name: 'websiteLinks',
      type: FieldMetadataType.LINKS,
      isComposite: true,
      subFields: [
        {
          name: 'primaryLinkUrl',
          type: 'TEXT',
          fullName: 'websiteLinks.primaryLinkUrl',
        },
        {
          name: 'primaryLinkLabel',
          type: 'TEXT',
          fullName: 'websiteLinks.primaryLinkLabel',
        },
        {
          name: 'secondaryLinks',
          type: 'TEXT',
          fullName: 'websiteLinks.secondaryLinks',
        },
      ],
    });
  });

  it('should handle actor composite fields', () => {
    const fields: Field[] = [
      { name: 'createdBy', type: FieldMetadataType.ACTOR },
    ];

    const result = buildFieldMetadata(fields);

    expect(result[0]).toEqual({
      name: 'createdBy',
      type: FieldMetadataType.ACTOR,
      isComposite: true,
      subFields: [
        { name: 'source', type: 'TEXT', fullName: 'createdBy.source' },
        { name: 'name', type: 'TEXT', fullName: 'createdBy.name' },
      ],
    });
  });

  it('should handle rich text composite fields', () => {
    const fields: Field[] = [
      { name: 'description', type: FieldMetadataType.RICH_TEXT_V2 },
    ];

    const result = buildFieldMetadata(fields);

    expect(result[0]).toEqual({
      name: 'description',
      type: FieldMetadataType.RICH_TEXT_V2,
      isComposite: true,
      subFields: [
        { name: 'blocknote', type: 'TEXT', fullName: 'description.blocknote' },
        { name: 'markdown', type: 'TEXT', fullName: 'description.markdown' },
      ],
    });
  });

  it('should handle empty fields array', () => {
    const fields: Field[] = [];

    const result = buildFieldMetadata(fields);

    expect(result).toEqual([]);
  });

  it('should handle fields without composite config', () => {
    const fields: Field[] = [
      { name: 'description', type: 'TEXT' },
      { name: 'count', type: 'NUMBER' },
      { name: 'isActive', type: 'BOOLEAN' },
    ];

    const result = buildFieldMetadata(fields);

    expect(result).toEqual([
      { name: 'description', type: 'TEXT', isComposite: false },
      { name: 'count', type: 'NUMBER', isComposite: false },
      { name: 'isActive', type: 'BOOLEAN', isComposite: false },
    ]);
  });

  it('should handle undefined field type', () => {
    const fields = [{ name: 'unknownField', type: undefined as any }];

    const result = buildFieldMetadata(fields);

    expect(result).toEqual([
      { name: 'unknownField', type: undefined, isComposite: false },
    ]);
  });

  it('should use getSubFieldType mapping for known combinations', () => {
    const fields: Field[] = [{ name: 'fullName', type: 'FULL_NAME' }];

    const result = buildFieldMetadata(fields);

    expect(result[0].subFields).toEqual([
      { name: 'firstName', type: 'TEXT', fullName: 'fullName.firstName' },
      { name: 'lastName', type: 'TEXT', fullName: 'fullName.lastName' },
    ]);
  });

  it('should default to TEXT type for unmapped subfields', () => {
    const fields: Field[] = [
      { name: 'customComposite', type: FieldMetadataType.PHONES },
    ];

    const result = buildFieldMetadata(fields);

    expect(
      result[0].subFields?.every((sf: { type: string }) => sf.type === 'TEXT'),
    ).toBe(true);
  });

  it('should handle all composite field types together', () => {
    const fields: Field[] = [
      { name: 'fullName', type: FieldMetadataType.FULL_NAME },
      { name: 'homeAddress', type: FieldMetadataType.ADDRESS },
      { name: 'salary', type: FieldMetadataType.CURRENCY },
      { name: 'contactPhone', type: FieldMetadataType.PHONES },
      { name: 'contactEmails', type: FieldMetadataType.EMAILS },
      { name: 'websiteLinks', type: FieldMetadataType.LINKS },
      { name: 'createdBy', type: FieldMetadataType.ACTOR },
      { name: 'notes', type: FieldMetadataType.RICH_TEXT_V2 },
    ];

    const result = buildFieldMetadata(fields);

    expect(result).toHaveLength(8);
    expect(result.every((field: FieldMetadata) => field.isComposite)).toBe(
      true,
    );

    // Verify that each composite field has the correct number of subFields
    expect(
      result.find((f: FieldMetadata) => f.name === 'fullName')?.subFields,
    ).toHaveLength(2);
    expect(
      result.find((f: FieldMetadata) => f.name === 'homeAddress')?.subFields,
    ).toHaveLength(8);
    expect(
      result.find((f: FieldMetadata) => f.name === 'salary')?.subFields,
    ).toHaveLength(2);
    expect(
      result.find((f: FieldMetadata) => f.name === 'contactPhone')?.subFields,
    ).toHaveLength(4);
    expect(
      result.find((f: FieldMetadata) => f.name === 'contactEmails')?.subFields,
    ).toHaveLength(2);
    expect(
      result.find((f: FieldMetadata) => f.name === 'websiteLinks')?.subFields,
    ).toHaveLength(3);
    expect(
      result.find((f: FieldMetadata) => f.name === 'createdBy')?.subFields,
    ).toHaveLength(2);
    expect(
      result.find((f: FieldMetadata) => f.name === 'notes')?.subFields,
    ).toHaveLength(2);
  });
});
