import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { RecordFilterValueDependencies } from '@/object-record/record-filter/types/RecordFilterValueDependencies';
import { computeRecordGqlOperationFilter } from '@/object-record/record-filter/utils/computeViewRecordGqlOperationFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { FieldMetadataType } from '~/generated/graphql';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const companiesMock = getCompaniesMock();

const companyMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
)!;

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const mockFilterValueDependencies: RecordFilterValueDependencies = {
  currentWorkspaceMemberId: '32219445-f587-4c40-b2b1-6d3205ed96da',
};

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('computeViewRecordGqlOperationFilter', () => {
  it('should work as expected for single filter', () => {
    const companyMockNameFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'name',
      );

    const nameFilter: RecordFilter = {
      id: 'company-name-filter',
      value: companiesMock[0].name,
      fieldMetadataId: companyMockNameFieldMetadataId?.id,
      displayValue: companiesMock[0].name,
      operand: RecordFilterOperand.Contains,
      type: 'TEXT',
      label: 'Name',
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [nameFilter],
      recordFilterGroups: [],
      fields: companyMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      name: {
        ilike: '%Linkedin%',
      },
    });
  });

  it('should work as expected for multiple filters', () => {
    const companyMockNameFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'name',
      );

    const companyMockEmployeesFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'employees',
      );

    const nameFilter: RecordFilter = {
      id: 'company-name-filter',
      value: companiesMock[0].name,
      fieldMetadataId: companyMockNameFieldMetadataId?.id,
      displayValue: companiesMock[0].name,
      operand: ViewFilterOperand.Contains,
      type: FieldMetadataType.TEXT,
      label: 'Name',
    };

    const employeesFilter: RecordFilter = {
      id: 'company-employees-filter',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '1000',
      operand: ViewFilterOperand.GreaterThan,
      type: FieldMetadataType.NUMBER,
      label: 'Employees',
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [nameFilter, employeesFilter],
      recordFilterGroups: [],
      fields: companyMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          name: {
            ilike: '%Linkedin%',
          },
        },
        {
          employees: {
            gte: 1000,
          },
        },
      ],
    });
  });
});

describe('should work as expected for the different field types', () => {
  it('address field type', () => {
    const companyMockAddressFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'address',
      );

    const addressFilterContains: RecordFilter = {
      id: 'company-address-filter-contains',
      value: '123 Main St',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '123 Main St',
      operand: ViewFilterOperand.Contains,
      type: FieldMetadataType.ADDRESS,
      label: 'Address',
    };

    const addressFilterDoesNotContain: RecordFilter = {
      id: 'company-address-filter-does-not-contain',
      value: '123 Main St',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '123 Main St',
      operand: ViewFilterOperand.DoesNotContain,
      type: FieldMetadataType.ADDRESS,
      label: 'Address',
    };

    const addressFilterIsEmpty: RecordFilter = {
      id: 'company-address-filter-is-empty',
      value: '',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      type: FieldMetadataType.ADDRESS,
      label: 'Address',
    };

    const addressFilterIsNotEmpty: RecordFilter = {
      id: 'company-address-filter-is-not-empty',
      value: '',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      label: 'Address',
      type: FieldMetadataType.ADDRESS,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [
        addressFilterContains,
        addressFilterDoesNotContain,
        addressFilterIsEmpty,
        addressFilterIsNotEmpty,
      ],
      recordFilterGroups: [],
      fields: companyMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              address: {
                addressStreet1: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressStreet2: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressCity: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressState: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressCountry: {
                  ilike: '%123 Main St%',
                },
              },
            },
            {
              address: {
                addressPostcode: {
                  ilike: '%123 Main St%',
                },
              },
            },
          ],
        },
        {
          and: [
            {
              not: {
                address: {
                  addressStreet1: {
                    ilike: '%123 Main St%',
                  },
                },
              },
            },
            {
              not: {
                address: {
                  addressStreet2: {
                    ilike: '%123 Main St%',
                  },
                },
              },
            },
            {
              not: {
                address: {
                  addressCity: {
                    ilike: '%123 Main St%',
                  },
                },
              },
            },
          ],
        },
        {
          and: [
            {
              or: [
                {
                  address: {
                    addressStreet1: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressStreet1: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressStreet2: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressStreet2: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressCity: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressCity: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressState: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressState: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressCountry: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressCountry: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
            {
              or: [
                {
                  address: {
                    addressPostcode: {
                      ilike: '',
                    },
                  },
                },
                {
                  address: {
                    addressPostcode: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          not: {
            and: [
              {
                or: [
                  {
                    address: {
                      addressStreet1: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressStreet1: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressStreet2: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressStreet2: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressCity: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressCity: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressState: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressState: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressCountry: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressCountry: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    address: {
                      addressPostcode: {
                        ilike: '',
                      },
                    },
                  },
                  {
                    address: {
                      addressPostcode: {
                        is: 'NULL',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    });
  });

  it('phones field type', () => {
    const personMockPhonesFieldMetadataId =
      personMockObjectMetadataItem.fields.find(
        (field) => field.name === 'phones',
      );

    const phonesFilterContains: RecordFilter = {
      id: 'person-phones-filter-contains',
      value: '1234567890',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '1234567890',
      operand: ViewFilterOperand.Contains,
      label: 'Phones',
      type: FieldMetadataType.PHONES,
    };

    const phonesFilterDoesNotContain: RecordFilter = {
      id: 'person-phones-filter-does-not-contain',
      value: '1234567890',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '1234567890',
      operand: ViewFilterOperand.DoesNotContain,
      label: 'Phones',
      type: FieldMetadataType.PHONES,
    };

    const phonesFilterIsEmpty: RecordFilter = {
      id: 'person-phones-filter-is-empty',
      value: '',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      label: 'Phones',
      type: FieldMetadataType.PHONES,
    };

    const phonesFilterIsNotEmpty: RecordFilter = {
      id: 'person-phones-filter-is-not-empty',
      value: '',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      label: 'Phones',
      type: FieldMetadataType.PHONES,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [
        phonesFilterContains,
        phonesFilterDoesNotContain,
        phonesFilterIsEmpty,
        phonesFilterIsNotEmpty,
      ],
      recordFilterGroups: [],
      fields: personMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              phones: {
                primaryPhoneNumber: {
                  ilike: '%1234567890%',
                },
              },
            },
          ],
        },
        {
          and: [
            {
              not: {
                phones: {
                  primaryPhoneNumber: {
                    ilike: '%1234567890%',
                  },
                },
              },
            },
          ],
        },
        {
          and: [
            {
              or: [
                {
                  phones: {
                    primaryPhoneNumber: {
                      is: 'NULL',
                    },
                  },
                },
                {
                  phones: {
                    primaryPhoneNumber: {
                      ilike: '',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          not: {
            and: [
              {
                or: [
                  {
                    phones: {
                      primaryPhoneNumber: {
                        is: 'NULL',
                      },
                    },
                  },
                  {
                    phones: {
                      primaryPhoneNumber: {
                        ilike: '',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    });
  });

  it('emails field type', () => {
    const personMockEmailFieldMetadataId =
      personMockObjectMetadataItem.fields.find(
        (field) => field.name === 'emails',
      );

    const emailsFilterContains: RecordFilter = {
      id: 'person-emails-filter-contains',
      value: 'test@test.com',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: 'test@test.com',
      operand: ViewFilterOperand.Contains,
      label: 'Emails',
      type: FieldMetadataType.EMAILS,
    };

    const emailsFilterDoesNotContain: RecordFilter = {
      id: 'person-emails-filter-does-not-contain',
      value: 'test@test.com',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: 'test@test.com',
      operand: ViewFilterOperand.DoesNotContain,
      label: 'Emails',
      type: FieldMetadataType.EMAILS,
    };

    const emailsFilterIsEmpty: RecordFilter = {
      id: 'person-emails-filter-is-empty',
      value: '',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      label: 'Emails',
      type: FieldMetadataType.EMAILS,
    };

    const emailsFilterIsNotEmpty: RecordFilter = {
      id: 'person-emails-filter-is-not-empty',
      value: '',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      label: 'Emails',
      type: FieldMetadataType.EMAILS,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [
        emailsFilterContains,
        emailsFilterDoesNotContain,
        emailsFilterIsEmpty,
        emailsFilterIsNotEmpty,
      ],
      recordFilterGroups: [],
      fields: personMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              emails: {
                primaryEmail: {
                  ilike: '%test@test.com%',
                },
              },
            },
          ],
        },
        {
          and: [
            {
              not: {
                emails: {
                  primaryEmail: {
                    ilike: '%test@test.com%',
                  },
                },
              },
            },
          ],
        },
        {
          or: [
            {
              emails: {
                primaryEmail: {
                  ilike: '',
                },
              },
            },
            {
              emails: {
                primaryEmail: {
                  is: 'NULL',
                },
              },
            },
          ],
        },
        {
          not: {
            or: [
              {
                emails: {
                  primaryEmail: {
                    ilike: '',
                  },
                },
              },
              {
                emails: {
                  primaryEmail: {
                    is: 'NULL',
                  },
                },
              },
            ],
          },
        },
      ],
    });
  });

  it('date field type', () => {
    const companyMockDateFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'createdAt',
      );

    const dateFilterIsAfter: RecordFilter = {
      id: 'company-date-filter-is-after',
      value: '2024-09-17T20:46:58.922Z',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '2024-09-17T20:46:58.922Z',
      operand: ViewFilterOperand.IsAfter,
      label: 'Created At',
      type: FieldMetadataType.DATE_TIME,
    };

    const dateFilterIsBefore: RecordFilter = {
      id: 'company-date-filter-is-before',
      value: '2024-09-17T20:46:58.922Z',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '2024-09-17T20:46:58.922Z',
      operand: ViewFilterOperand.IsBefore,
      label: 'Created At',
      type: FieldMetadataType.DATE_TIME,
    };

    const dateFilterIs: RecordFilter = {
      id: 'company-date-filter-is',
      value: '2024-09-17T20:46:58.922Z',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '2024-09-17T20:46:58.922Z',
      operand: ViewFilterOperand.Is,
      label: 'Created At',
      type: FieldMetadataType.DATE_TIME,
    };

    const dateFilterIsEmpty: RecordFilter = {
      id: 'company-date-filter-is-empty',
      value: '',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      label: 'Created At',
      type: FieldMetadataType.DATE_TIME,
    };

    const dateFilterIsNotEmpty: RecordFilter = {
      id: 'company-date-filter-is-not-empty',
      value: '',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      label: 'Created At',
      type: FieldMetadataType.DATE_TIME,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [
        dateFilterIsAfter,
        dateFilterIsBefore,
        dateFilterIs,
        dateFilterIsEmpty,
        dateFilterIsNotEmpty,
      ],
      recordFilterGroups: [],
      fields: companyMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          createdAt: {
            gt: '2024-09-17T20:46:58.922Z',
          },
        },
        {
          createdAt: {
            lt: '2024-09-17T20:46:58.922Z',
          },
        },
        {
          and: [
            {
              createdAt: {
                lte: '2024-09-17T23:59:59.999Z',
              },
            },
            {
              createdAt: {
                gte: '2024-09-17T00:00:00.000Z',
              },
            },
          ],
        },
        {
          createdAt: {
            is: 'NULL',
          },
        },
        {
          not: {
            createdAt: {
              is: 'NULL',
            },
          },
        },
      ],
    });
  });

  it('number field type', () => {
    const companyMockEmployeesFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'employees',
      );

    const employeesFilterIsGreaterThan: RecordFilter = {
      id: 'company-employees-filter-is-greater-than',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '1000',
      operand: ViewFilterOperand.GreaterThan,
      label: 'Employees',
      type: FieldMetadataType.NUMBER,
    };

    const employeesFilterIsLessThan: RecordFilter = {
      id: 'company-employees-filter-is-less-than',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '1000',
      operand: ViewFilterOperand.LessThan,
      label: 'Employees',
      type: FieldMetadataType.NUMBER,
    };

    const employeesFilterIsEmpty: RecordFilter = {
      id: 'company-employees-filter-is-empty',
      value: '',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      label: 'Employees',
      type: FieldMetadataType.NUMBER,
    };

    const employeesFilterIsNotEmpty: RecordFilter = {
      id: 'company-employees-filter-is-not-empty',
      value: '',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      label: 'Employees',
      type: FieldMetadataType.NUMBER,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [
        employeesFilterIsGreaterThan,
        employeesFilterIsLessThan,
        employeesFilterIsEmpty,
        employeesFilterIsNotEmpty,
      ],
      recordFilterGroups: [],
      fields: companyMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          employees: {
            gte: 1000,
          },
        },
        {
          employees: {
            lte: 1000,
          },
        },
        {
          employees: {
            is: 'NULL',
          },
        },
        {
          not: {
            employees: {
              is: 'NULL',
            },
          },
        },
      ],
    });
  });

  it('select field type with empty options', () => {
    const selectFieldMetadata = companyMockObjectMetadataItem.fields.find(
      (field) => field.type === FieldMetadataType.SELECT,
    );

    if (!selectFieldMetadata) {
      throw new Error(
        `Select field metadata not found ${companyMockObjectMetadataItem.fields.map((field) => [field.name, field.type])}`,
      );
    }

    const selectFilterIs: RecordFilter = {
      id: 'company-select-filter-is',
      value: '["option1",""]',
      fieldMetadataId: selectFieldMetadata?.id,
      displayValue: '["option1",""]',
      operand: ViewFilterOperand.Is,
      label: 'Select',
      type: FieldMetadataType.SELECT,
    };

    const selectFilterIsNot: RecordFilter = {
      id: 'company-select-filter-is-not',
      value: '["option1",""]',
      fieldMetadataId: selectFieldMetadata.id,
      displayValue: '["option1",""]',
      operand: ViewFilterOperand.IsNot,
      label: 'Select',
      type: FieldMetadataType.SELECT,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [selectFilterIs, selectFilterIsNot],
      recordFilterGroups: [],
      fields: companyMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              [selectFieldMetadata.name]: {
                in: ['option1'],
              },
            },
            {
              [selectFieldMetadata.name]: {
                is: 'NULL',
              },
            },
          ],
        },
        {
          and: [
            {
              not: {
                [selectFieldMetadata.name]: {
                  in: ['option1'],
                },
              },
            },
            {
              not: {
                [selectFieldMetadata.name]: {
                  is: 'NULL',
                },
              },
            },
          ],
        },
      ],
    });
  });

  it('multi-select field type with empty options', () => {
    const multiSelectFieldMetadata = companyMockObjectMetadataItem.fields.find(
      (field) => field.type === FieldMetadataType.MULTI_SELECT,
    )!;

    const multiSelectFilterContains: RecordFilter = {
      id: 'company-multi-select-filter-contains',
      value: '["option1",""]',
      fieldMetadataId: multiSelectFieldMetadata.id,
      displayValue: '["option1",""]',
      operand: ViewFilterOperand.Contains,
      label: 'MultiSelect',
      type: FieldMetadataType.MULTI_SELECT,
    };

    const multiSelectFilterDoesNotContain: RecordFilter = {
      id: 'company-multi-select-filter-does-not-contain',
      value: '["option1",""]',
      fieldMetadataId: multiSelectFieldMetadata.id,
      displayValue: '["option1",""]',
      operand: ViewFilterOperand.DoesNotContain,
      label: 'MultiSelect',
      type: FieldMetadataType.MULTI_SELECT,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [
        multiSelectFilterContains,
        multiSelectFilterDoesNotContain,
      ],
      recordFilterGroups: [],
      fields: companyMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              [multiSelectFieldMetadata.name]: {
                containsAny: ['option1'],
              },
            },
            {
              [multiSelectFieldMetadata.name]: {
                isEmptyArray: true,
              },
            },
          ],
        },
        {
          or: [
            {
              not: {
                [multiSelectFieldMetadata.name]: {
                  containsAny: ['option1'],
                },
              },
            },
            {
              [multiSelectFieldMetadata.name]: {
                isEmptyArray: true,
              },
            },
            {
              [multiSelectFieldMetadata.name]: {
                is: 'NULL',
              },
            },
          ],
        },
      ],
    });
  });
});
