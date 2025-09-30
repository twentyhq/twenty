import { type FieldCurrencyValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import {
  ViewFilterOperand,
  type RecordFilterValueDependencies,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  isDefined,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getCompaniesMock } from '~/testing/mock-data/companies';

import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companiesMock = getCompaniesMock();

const companyMockObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('company');

const petMockObjectMetadataItem = getMockObjectMetadataItemOrThrow('pet');

const personMockObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

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

    if (!isDefined(companyMockNameFieldMetadataId)) {
      throw new Error('Company mock name field metadata ID is undefined');
    }

    const nameFilter: RecordFilter = {
      id: 'company-name-filter',
      value: companiesMock[0].name,
      fieldMetadataId: companyMockNameFieldMetadataId.id,
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

    if (!isDefined(companyMockNameFieldMetadataId)) {
      throw new Error('Company mock name field metadata ID is undefined');
    }

    const companyMockEmployeesFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'employees',
      );

    if (!isDefined(companyMockEmployeesFieldMetadataId)) {
      throw new Error('Company mock employees field metadata ID is undefined');
    }

    const nameFilter: RecordFilter = {
      id: 'company-name-filter',
      value: companiesMock[0].name,
      fieldMetadataId: companyMockNameFieldMetadataId.id,
      displayValue: companiesMock[0].name,
      operand: ViewFilterOperand.Contains,
      type: FieldMetadataType.TEXT,
      label: 'Name',
    };

    const employeesFilter: RecordFilter = {
      id: 'company-employees-filter',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId.id,
      displayValue: '1000',
      operand: ViewFilterOperand.GreaterThanOrEqual,
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

    if (!isDefined(companyMockAddressFieldMetadataId)) {
      throw new Error('Company mock address field metadata ID is undefined');
    }

    const addressFilterContains: RecordFilter = {
      id: 'company-address-filter-contains',
      value: '123 Main St',
      fieldMetadataId: companyMockAddressFieldMetadataId.id,
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
              or: [
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
                  not: {
                    address: {
                      addressStreet2: {
                        ilike: '%123 Main St%',
                      },
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
                  not: {
                    address: {
                      addressCity: {
                        ilike: '%123 Main St%',
                      },
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
                  not: {
                    address: {
                      addressState: {
                        ilike: '%123 Main St%',
                      },
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
                  not: {
                    address: {
                      addressPostcode: {
                        ilike: '%123 Main St%',
                      },
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
            {
              or: [
                {
                  not: {
                    address: {
                      addressCountry: {
                        ilike: '%123 Main St%',
                      },
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

    if (!isDefined(personMockPhonesFieldMetadataId)) {
      throw new Error('Person mock phones field metadata ID is undefined');
    }

    const phonesFilterContains: RecordFilter = {
      id: 'person-phones-filter-contains',
      value: '1234567890',
      fieldMetadataId: personMockPhonesFieldMetadataId.id,
      displayValue: '1234567890',
      operand: ViewFilterOperand.Contains,
      label: 'Phones',
      type: FieldMetadataType.PHONES,
    };

    const phonesFilterDoesNotContain: RecordFilter = {
      id: 'person-phones-filter-does-not-contain',
      value: '1234567890',
      fieldMetadataId: personMockPhonesFieldMetadataId.id,
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
            {
              phones: {
                primaryPhoneCallingCode: {
                  ilike: '%1234567890%',
                },
              },
            },
            {
              phones: {
                additionalPhones: {
                  like: '%1234567890%',
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
            {
              not: {
                phones: {
                  primaryPhoneCallingCode: {
                    ilike: '%1234567890%',
                  },
                },
              },
            },
            {
              or: [
                {
                  not: {
                    phones: {
                      additionalPhones: {
                        like: '%1234567890%',
                      },
                    },
                  },
                },
                {
                  phones: {
                    additionalPhones: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          and: [
            {
              or: [
                {
                  phones: {
                    primaryPhoneNumber: { is: 'NULL' },
                  },
                },
                {
                  phones: {
                    primaryPhoneNumber: { ilike: '' },
                  },
                },
              ],
            },
            {
              or: [
                {
                  phones: {
                    primaryPhoneCallingCode: { is: 'NULL' },
                  },
                },
                {
                  phones: {
                    primaryPhoneCallingCode: { ilike: '' },
                  },
                },
              ],
            },
            {
              or: [
                {
                  phones: {
                    additionalPhones: { is: 'NULL' },
                  },
                },
                {
                  phones: {
                    additionalPhones: { like: '[]' },
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
                      primaryPhoneNumber: { is: 'NULL' },
                    },
                  },
                  {
                    phones: {
                      primaryPhoneNumber: { ilike: '' },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    phones: {
                      primaryPhoneCallingCode: { is: 'NULL' },
                    },
                  },
                  {
                    phones: {
                      primaryPhoneCallingCode: { ilike: '' },
                    },
                  },
                ],
              },
              {
                or: [
                  {
                    phones: {
                      additionalPhones: { is: 'NULL' },
                    },
                  },
                  {
                    phones: {
                      additionalPhones: { like: '[]' },
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
    const personMockEmailFieldMetadataId = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: personMockObjectMetadataItem,
      fieldName: 'emails',
    });

    const emailsFilterContains: RecordFilter = {
      id: 'person-emails-filter-contains',
      value: 'test@test.com',
      fieldMetadataId: personMockEmailFieldMetadataId.id,
      displayValue: 'test@test.com',
      operand: ViewFilterOperand.Contains,
      label: 'Emails',
      type: FieldMetadataType.EMAILS,
    };

    const emailsFilterDoesNotContain: RecordFilter = {
      id: 'person-emails-filter-does-not-contain',
      value: 'test@test.com',
      fieldMetadataId: personMockEmailFieldMetadataId.id,
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
            {
              emails: {
                additionalEmails: {
                  like: '%test@test.com%',
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
            {
              or: [
                {
                  not: {
                    emails: {
                      additionalEmails: {
                        like: '%test@test.com%',
                      },
                    },
                  },
                },
                {
                  emails: {
                    additionalEmails: {
                      is: 'NULL',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          and: [
            {
              or: [
                {
                  emails: {
                    primaryEmail: {
                      eq: '',
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
              or: [
                {
                  emails: {
                    additionalEmails: {
                      is: 'NULL',
                    },
                  },
                },
                {
                  emails: {
                    additionalEmails: {
                      like: '[]',
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
                    emails: {
                      primaryEmail: {
                        eq: '',
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
                or: [
                  {
                    emails: {
                      additionalEmails: {
                        is: 'NULL',
                      },
                    },
                  },
                  {
                    emails: {
                      additionalEmails: {
                        like: '[]',
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

  it('date field type', () => {
    const companyMockDateFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'createdAt',
      );

    if (!isDefined(companyMockDateFieldMetadataId)) {
      throw new Error('Company mock date field metadata ID is undefined');
    }

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
    const companyMockEmployeesFieldMetadataId = getMockFieldMetadataItemOrThrow(
      {
        objectMetadataItem: companyMockObjectMetadataItem,
        fieldName: 'employees',
      },
    );

    const employeesFilterIsGreaterThan: RecordFilter = {
      id: 'company-employees-filter-is-greater-than',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '1000',
      operand: ViewFilterOperand.GreaterThanOrEqual,
      label: 'Employees',
      type: FieldMetadataType.NUMBER,
    };

    const employeesFilterIsLessThan: RecordFilter = {
      id: 'company-employees-filter-is-less-than',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '1000',
      operand: ViewFilterOperand.LessThanOrEqual,
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

  it('currency amount micros sub field type', () => {
    const companyMockARRFieldMetadataId = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: companyMockObjectMetadataItem,
      fieldName: 'annualRecurringRevenue',
    });

    const ARRFilterIsGreaterThan: RecordFilter = {
      id: 'company-ARR-filter-is-greater-than',
      value: '1000',
      fieldMetadataId: companyMockARRFieldMetadataId?.id,
      displayValue: '1000',
      operand: RecordFilterOperand.GreaterThanOrEqual,
      subFieldName: 'amountMicros' satisfies Extract<
        keyof FieldCurrencyValue,
        'amountMicros'
      >,
      label: 'Amount',
      type: FieldMetadataType.CURRENCY,
    };

    const ARRFilterIsLessThan: RecordFilter = {
      id: 'company-ARR-filter-is-less-than',
      value: '1000',
      fieldMetadataId: companyMockARRFieldMetadataId.id,
      displayValue: '1000',
      operand: RecordFilterOperand.LessThanOrEqual,
      subFieldName: 'amountMicros' satisfies Extract<
        keyof FieldCurrencyValue,
        'amountMicros'
      >,
      label: 'Amount',
      type: FieldMetadataType.CURRENCY,
    };

    const ARRFilterIs: RecordFilter = {
      id: 'company-ARR-filter-is',
      value: '1000',
      fieldMetadataId: companyMockARRFieldMetadataId.id,
      displayValue: '1000',
      operand: RecordFilterOperand.Is,
      subFieldName: 'amountMicros' satisfies Extract<
        keyof FieldCurrencyValue,
        'amountMicros'
      >,
      label: 'Amount',
      type: FieldMetadataType.CURRENCY,
    };

    const ARRFilterIsNot: RecordFilter = {
      id: 'company-ARR-filter-is-not',
      value: '1000',
      fieldMetadataId: companyMockARRFieldMetadataId.id,
      displayValue: '1000',
      operand: RecordFilterOperand.IsNot,
      subFieldName: 'amountMicros' satisfies Extract<
        keyof FieldCurrencyValue,
        'amountMicros'
      >,
      label: 'Amount',
      type: FieldMetadataType.CURRENCY,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [
        ARRFilterIsGreaterThan,
        ARRFilterIsLessThan,
        ARRFilterIs,
        ARRFilterIsNot,
      ],
      recordFilterGroups: [],
      fields: companyMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          annualRecurringRevenue: {
            amountMicros: {
              gte: 1000 * 1000000,
            },
          },
        },
        {
          annualRecurringRevenue: {
            amountMicros: {
              lte: 1000 * 1000000,
            },
          },
        },
        {
          annualRecurringRevenue: {
            amountMicros: {
              eq: 1000 * 1000000,
            },
          },
        },
        {
          not: {
            annualRecurringRevenue: {
              amountMicros: {
                eq: 1000 * 1000000,
              },
            },
          },
        },
      ],
    });
  });

  it('currency currency code sub field type', () => {
    const companyMockARRFieldMetadataId = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: companyMockObjectMetadataItem,
      fieldName: 'annualRecurringRevenue',
    });

    const ARRFilterIn: RecordFilter = {
      id: 'company-ARR-filter-in',
      value: '["USD"]',
      fieldMetadataId: companyMockARRFieldMetadataId.id,
      displayValue: 'USD',
      operand: RecordFilterOperand.Is,
      subFieldName: 'currencyCode' satisfies Extract<
        keyof FieldCurrencyValue,
        'currencyCode'
      >,
      label: 'Currency',
      type: FieldMetadataType.CURRENCY,
    };

    const ARRFilterNotIn: RecordFilter = {
      id: 'company-ARR-filter-not-in',
      value: '["USD"]',
      fieldMetadataId: companyMockARRFieldMetadataId.id,
      displayValue: 'Not USD',
      operand: RecordFilterOperand.IsNot,
      subFieldName: 'currencyCode' satisfies Extract<
        keyof FieldCurrencyValue,
        'currencyCode'
      >,
      label: 'Currency',
      type: FieldMetadataType.CURRENCY,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [ARRFilterIn, ARRFilterNotIn],
      recordFilterGroups: [],
      fields: companyMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          annualRecurringRevenue: {
            currencyCode: {
              in: ['USD'],
            },
          },
        },
        {
          not: {
            annualRecurringRevenue: {
              currencyCode: {
                in: ['USD'],
              },
            },
          },
        },
      ],
    });
  });

  it('select field type with empty options', () => {
    const selectFieldMetadata = petMockObjectMetadataItem.fields.find(
      (field) => field.type === FieldMetadataType.SELECT,
    );

    if (!selectFieldMetadata) {
      throw new Error(
        `Select field metadata not found ${petMockObjectMetadataItem.fields.map((field) => [field.name, field.type])}`,
      );
    }

    const selectFilterIs: RecordFilter = {
      id: 'pet-select-filter-is',
      value: '["DOG",""]',
      fieldMetadataId: selectFieldMetadata?.id,
      displayValue: '["Dog",""]',
      operand: ViewFilterOperand.Is,
      label: 'Select',
      type: FieldMetadataType.SELECT,
    };

    const selectFilterIsNot: RecordFilter = {
      id: 'company-select-filter-is-not',
      value: '["DOG",""]',
      fieldMetadataId: selectFieldMetadata.id,
      displayValue: '["Dog",""]',
      operand: ViewFilterOperand.IsNot,
      label: 'Select',
      type: FieldMetadataType.SELECT,
    };

    const result = computeRecordGqlOperationFilter({
      filterValueDependencies: mockFilterValueDependencies,
      recordFilters: [selectFilterIs, selectFilterIsNot],
      recordFilterGroups: [],
      fields: petMockObjectMetadataItem.fields,
    });

    expect(result).toEqual({
      and: [
        {
          or: [
            {
              [selectFieldMetadata.name]: {
                in: ['DOG'],
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
                  in: ['DOG'],
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
