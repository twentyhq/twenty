import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { filterSelectOptionsOfFieldMetadataItem } from '@/object-record/record-filter/utils/filterSelectOptionsOfFieldMetadataItem';
import { turnAnyFieldFilterIntoRecordGqlFilter } from '@/object-record/record-filter/utils/turnAnyFieldFilterIntoRecordGqlFilter';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const baseFieldMetadataItem: FieldMetadataItem = {
  id: 'base-field-metadata-item-id',
  createdAt: new Date().toISOString(),
  label: 'Test',
  name: 'test',
  type: FieldMetadataType.TEXT,
  updatedAt: new Date().toISOString(),
};

const textFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'text-field-id',
  name: 'textField',
};

const addressFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'address-field-id',
  type: FieldMetadataType.ADDRESS,
  name: 'addressField',
};

const linksFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'links-field-id',
  type: FieldMetadataType.LINKS,
  name: 'linksField',
};

const fullNameFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'full-name-field-id',
  type: FieldMetadataType.FULL_NAME,
  name: 'fullNameField',
};

const arrayFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'array-field-id',
  type: FieldMetadataType.ARRAY,
  name: 'arrayField',
};

const emailsFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'emails-field-id',
  type: FieldMetadataType.EMAILS,
  name: 'emailsField',
};

const phonesFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'phones-field-id',
  type: FieldMetadataType.PHONES,
  name: 'phonesField',
};

const numberFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'number-field-id',
  type: FieldMetadataType.NUMBER,
  name: 'numberField',
};

const currencyFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'currency-field-id',
  type: FieldMetadataType.CURRENCY,
  name: 'currencyField',
};

const selectFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'select-field-id',
  type: FieldMetadataType.SELECT,
  name: 'selectField',
  options: [
    {
      color: 'blue',
      id: '1',
      label: 'blue',
      position: 1,
      value: 'BLUE',
    },
    {
      color: 'red',
      id: '2',
      label: 'red',
      position: 2,
      value: 'RED',
    },
  ],
};

const multiSelectFieldMetadataItem: FieldMetadataItem = {
  ...baseFieldMetadataItem,
  id: 'multi-select-field-id',
  type: FieldMetadataType.MULTI_SELECT,
  name: 'multiSelect',
  options: [
    {
      color: 'blue',
      id: '1',
      label: 'blue',
      position: 1,
      value: 'BLUE',
    },
    {
      color: 'red',
      id: '2',
      label: 'red',
      position: 2,
      value: 'RED',
    },
  ],
};

const mockObjectMetadataItem: ObjectMetadataItem = {
  id: 'mock-object-metadata-item',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  indexMetadatas: [],
  isActive: true,
  isCustom: true,
  isLabelSyncedWithName: true,
  isRemote: false,
  isSearchable: true,
  isSystem: false,
  labelIdentifierFieldMetadataId: 'mock-id',
  labelPlural: 'Tests',
  labelSingular: 'Test',
  nameSingular: 'test',
  namePlural: 'tests',
  fields: [],
};

const mockObjectMetadataItemWithAllFields: ObjectMetadataItem = {
  ...mockObjectMetadataItem,
  fields: [
    textFieldMetadataItem,
    addressFieldMetadataItem,
    linksFieldMetadataItem,
    fullNameFieldMetadataItem,
    arrayFieldMetadataItem,
    emailsFieldMetadataItem,
    phonesFieldMetadataItem,
    numberFieldMetadataItem,
    currencyFieldMetadataItem,
    selectFieldMetadataItem,
    multiSelectFieldMetadataItem,
  ],
};

describe('turnAnyFieldFilterIntoRecordGqlFilter', () => {
  describe('TEXT field type', () => {
    it('should generate correct filter for text field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [textFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [textFieldMetadataItem.name]: {
          ilike: `%${filterValue}%`,
        },
      });
    });
  });

  describe('ADDRESS field type', () => {
    it('should generate correct filter for address field', () => {
      const filterValue = 'New York';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [addressFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [addressFieldMetadataItem.name]: {
              addressStreet1: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressStreet2: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressCity: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressState: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressCountry: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [addressFieldMetadataItem.name]: {
              addressPostcode: {
                ilike: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('LINKS field type', () => {
    it('should generate correct filter for links field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [linksFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [linksFieldMetadataItem.name]: {
              primaryLinkUrl: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [linksFieldMetadataItem.name]: {
              primaryLinkLabel: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [linksFieldMetadataItem.name]: {
              secondaryLinks: {
                like: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('FULL_NAME field type', () => {
    it('should generate correct filter for full name field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [fullNameFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [fullNameFieldMetadataItem.name]: {
              firstName: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [fullNameFieldMetadataItem.name]: {
              lastName: {
                ilike: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('ARRAY field type', () => {
    it('should generate correct filter for array field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [arrayFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [arrayFieldMetadataItem.name]: {
          containsIlike: `%${filterValue}%`,
        },
      });
    });
  });

  describe('EMAILS field type', () => {
    it('should generate correct filter for emails field', () => {
      const filterValue = 'test';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [emailsFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [emailsFieldMetadataItem.name]: {
              primaryEmail: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [emailsFieldMetadataItem.name]: {
              additionalEmails: {
                like: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('PHONES field type', () => {
    it('should generate correct filter for phones field', () => {
      const filterValue = '123';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [phonesFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        or: [
          {
            [phonesFieldMetadataItem.name]: {
              primaryPhoneNumber: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [phonesFieldMetadataItem.name]: {
              primaryPhoneCallingCode: {
                ilike: `%${filterValue}%`,
              },
            },
          },
          {
            [phonesFieldMetadataItem.name]: {
              additionalPhones: {
                like: `%${filterValue}%`,
              },
            },
          },
        ],
      });
    });
  });

  describe('NUMBER field type', () => {
    it('should generate correct filter for number field with numeric value', () => {
      const filterValue = '123.1';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [numberFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [numberFieldMetadataItem.name]: {
          eq: 123.1,
        },
      });
    });

    it('should not generate filter for number field with non-numeric value', () => {
      const filterValue = 'not a number';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [numberFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });
  });

  describe('CURRENCY field type', () => {
    it('should generate correct filter for currency field with numeric value', () => {
      const filterValue = '123';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [currencyFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [currencyFieldMetadataItem.name]: {
          amountMicros: {
            eq: 123000000,
          },
        },
      });
    });

    it('should generate correct filter for currency field with currency code', () => {
      const filterValue = 'USD';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [currencyFieldMetadataItem],
        },
      });

      expect(
        (result.recordGqlOperationFilter.or as any)?.[0][
          currencyFieldMetadataItem.name
        ].currencyCode.in.includes(filterValue),
      ).toBe(true);
    });
  });

  describe('SELECT field type', () => {
    it('should generate correct filter for select field with matching option', () => {
      const filterValue = 'r';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [selectFieldMetadataItem],
        },
      });

      const { foundCorrespondingSelectOptions: expectedOptions } =
        filterSelectOptionsOfFieldMetadataItem({
          fieldMetadataItem: selectFieldMetadataItem,
          filterValue,
        });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [selectFieldMetadataItem.name]: {
          in: expectedOptions?.map((option) => option.value),
        },
      });
    });

    it('should not generate filter for select field with non-matching value', () => {
      const filterValue = 'not-found';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [selectFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });
  });

  describe('MULTI_SELECT field type', () => {
    it('should generate correct filter for multi-select field with matching option', () => {
      const filterValue = 'r';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [multiSelectFieldMetadataItem],
        },
      });

      const { foundCorrespondingSelectOptions: expectedOptions } =
        filterSelectOptionsOfFieldMetadataItem({
          fieldMetadataItem: multiSelectFieldMetadataItem,
          filterValue,
        });

      expect(result.recordGqlOperationFilter.or).toContainEqual({
        [multiSelectFieldMetadataItem.name]: {
          containsAny: expectedOptions?.map((option) => option.value),
        },
      });
    });

    it('should not generate filter for multi-select field with non-matching value', () => {
      const filterValue = 'not-found';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: {
          ...mockObjectMetadataItem,
          fields: [multiSelectFieldMetadataItem],
        },
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });
  });

  describe('combined field filters', () => {
    it('should generate OR filter combining all matching field types', () => {
      const filterValue = 'a';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: mockObjectMetadataItemWithAllFields,
      });

      expect(result.recordGqlOperationFilter).toHaveProperty('or');
      expect(Array.isArray(result.recordGqlOperationFilter.or)).toBe(true);
      expect(
        (result.recordGqlOperationFilter.or as any[])?.length,
      ).toBeGreaterThan(0);
    });

    it('should handle empty filter value', () => {
      const filterValue = '';

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue,
        objectMetadataItem: mockObjectMetadataItemWithAllFields,
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });

    it('should handle object with no fields', () => {
      const emptyObjectMetadata = {
        ...mockObjectMetadataItem,
        fields: [],
      };

      const result = turnAnyFieldFilterIntoRecordGqlFilter({
        filterValue: 'test',
        objectMetadataItem: emptyObjectMetadata,
      });

      expect(result.recordGqlOperationFilter).toEqual({});
    });
  });
});
