import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { spreadsheetImportGetUnicityRowHook } from '@/object-record/spreadsheet-import/utils/spreadsheetImportGetUnicityRowHook';
import { ImportedStructuredRow } from '@/spreadsheet-import/types';
import { isDefined } from 'twenty-shared/utils';
import { IndexType } from '~/generated-metadata/graphql';
import { getMockCompanyObjectMetadataItem } from '~/testing/mock-data/companies';

describe('spreadsheetImportGetUnicityRowHook', () => {
  const baseMockCompany = getMockCompanyObjectMetadataItem();

  const nameField = baseMockCompany.fields.find(
    (field) => field.name === 'name',
  );

  const domainNameField = baseMockCompany.fields.find(
    (field) => field.name === 'domainName',
  );

  const employeesField = baseMockCompany.fields.find(
    (field) => field.name === 'employees',
  );

  if (
    !isDefined(nameField) ||
    !isDefined(domainNameField) ||
    !isDefined(employeesField)
  ) {
    throw new Error(
      'Name, domainName or employees field not found in company metadata',
    );
  }

  const mockObjectMetadataItem: ObjectMetadataItem = {
    ...baseMockCompany,
    indexMetadatas: [
      {
        id: 'unique-name-index',
        name: 'unique_name_idx',
        indexType: IndexType.BTREE,
        isUnique: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        indexFieldMetadatas: [
          {
            id: 'index-field-2',
            fieldMetadataId: domainNameField.id,
            order: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
      {
        id: 'unique-domain-name-index',
        name: 'unique_domain_name_idx',
        indexType: IndexType.BTREE,
        isUnique: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        indexFieldMetadatas: [
          {
            id: 'index-field-1',
            fieldMetadataId: nameField.id,
            order: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'index-field-3',
            fieldMetadataId: employeesField.id,
            order: 1,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    ],
  };

  it('should return row with error if row is not unique - index on composite field', () => {
    const hook = spreadsheetImportGetUnicityRowHook(mockObjectMetadataItem);
    const testData: ImportedStructuredRow<string>[] = [
      { 'Link URL (domainName)': 'https://duplicaTe.com' },
      { 'Link URL (domainName)': 'https://duplicate.com' },
      { 'Link URL (domainName)': 'https://other.com' },
    ];

    const addErrorMock = jest.fn();

    const result = hook(testData[1], addErrorMock, testData);

    expect(addErrorMock).toHaveBeenCalledWith('Link URL (domainName)', {
      message:
        'This Link URL (domainName) value already exists in your import data',
      level: 'error',
    });
    expect(result).toBe(testData[1]);
  });

  it('should return row with error if row is not unique - index on id', () => {
    const hook = spreadsheetImportGetUnicityRowHook(mockObjectMetadataItem);

    const testData: ImportedStructuredRow<string>[] = [
      { 'Link URL (domainName)': 'test.com', id: '1' },
      { 'Link URL (domainName)': 'test2.com', id: '1' },
      { 'Link URL (domainName)': 'test3.com', id: '3' },
    ];

    const addErrorMock = jest.fn();

    const result = hook(testData[1], addErrorMock, testData);

    expect(addErrorMock).toHaveBeenCalledWith('id', {
      message: 'This id value already exists in your import data',
      level: 'error',
    });
    expect(result).toBe(testData[1]);
  });

  it('should return row with error if row is not unique - multi fields index', () => {
    const hook = spreadsheetImportGetUnicityRowHook(mockObjectMetadataItem);

    const testData: ImportedStructuredRow<string>[] = [
      { name: 'test', employees: '100', id: '1' },
      { name: 'test', employees: '100', id: '2' },
      { name: 'test', employees: '101', id: '3' },
    ];

    const addErrorMock = jest.fn();

    const result = hook(testData[1], addErrorMock, testData);

    expect(addErrorMock).toHaveBeenCalledWith('name', {
      message: 'This name value already exists in your import data',
      level: 'error',
    });
    expect(addErrorMock).toHaveBeenCalledWith('employees', {
      message: 'This employees value already exists in your import data',
      level: 'error',
    });
    expect(result).toBe(testData[1]);
  });
  it('should not add error if row values are unique', () => {
    const hook = spreadsheetImportGetUnicityRowHook(mockObjectMetadataItem);

    const testData: ImportedStructuredRow<string>[] = [
      {
        name: 'test',
        'Link URL (domainName)': 'test.com',
        employees: '100',
        id: '1',
      },
      {
        name: 'test',
        'Link URL (domainName)': 'test2.com',
        employees: '101',
        id: '2',
      },
      {
        name: 'test',
        'Link URL (domainName)': 'test3.com',
        employees: '102',
        id: '3',
      },
    ];

    const addErrorMock = jest.fn();

    const result = hook(testData[1], addErrorMock, testData);

    expect(addErrorMock).not.toHaveBeenCalled();
    expect(result).toBe(testData[1]);
  });
});
