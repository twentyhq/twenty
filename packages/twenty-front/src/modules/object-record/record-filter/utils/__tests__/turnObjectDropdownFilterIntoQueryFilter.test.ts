import {
  ObjectDropdownFilter,
  turnObjectDropdownFilterIntoQueryFilter,
} from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/objectMetadataItems';

const companiesMock = getCompaniesMock();

const companyMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
)!;

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('turnObjectDropdownFilterIntoQueryFilter', () => {
  it('should work as expected for single filter', () => {
    const companyMockNameFieldMetadataId =
      companyMockObjectMetadataItem.fields.find(
        (field) => field.name === 'name',
      );

    const nameFilter: ObjectDropdownFilter = {
      id: 'company-name-filter',
      value: companiesMock[0].name,
      fieldMetadataId: companyMockNameFieldMetadataId?.id,
      displayValue: companiesMock[0].name,
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'TEXT',
      },
    };

    const result = turnObjectDropdownFilterIntoQueryFilter(
      [nameFilter],
      companyMockObjectMetadataItem.fields,
    );

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

    const nameFilter: ObjectDropdownFilter = {
      id: 'company-name-filter',
      value: companiesMock[0].name,
      fieldMetadataId: companyMockNameFieldMetadataId?.id,
      displayValue: companiesMock[0].name,
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'TEXT',
      },
    };

    const employeesFilter: ObjectDropdownFilter = {
      id: 'company-employees-filter',
      value: '1000',
      fieldMetadataId: companyMockEmployeesFieldMetadataId?.id,
      displayValue: '1000',
      operand: ViewFilterOperand.GreaterThan,
      definition: {
        type: 'NUMBER',
      },
    };

    const result = turnObjectDropdownFilterIntoQueryFilter(
      [nameFilter, employeesFilter],
      companyMockObjectMetadataItem.fields,
    );

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

    const addressFilterContains: ObjectDropdownFilter = {
      id: 'company-address-filter-contains',
      value: '123 Main St',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '123 Main St',
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'ADDRESS',
      },
    };

    const addressFilterDoesNotContain: ObjectDropdownFilter = {
      id: 'company-address-filter-does-not-contain',
      value: '123 Main St',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '123 Main St',
      operand: ViewFilterOperand.DoesNotContain,
      definition: {
        type: 'ADDRESS',
      },
    };

    const addressFilterIsEmpty: ObjectDropdownFilter = {
      id: 'company-address-filter-is-empty',
      value: '',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      definition: {
        type: 'ADDRESS',
      },
    };

    const addressFilterIsNotEmpty: ObjectDropdownFilter = {
      id: 'company-address-filter-is-not-empty',
      value: '',
      fieldMetadataId: companyMockAddressFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      definition: {
        type: 'ADDRESS',
      },
    };

    const result = turnObjectDropdownFilterIntoQueryFilter(
      [
        addressFilterContains,
        addressFilterDoesNotContain,
        addressFilterIsEmpty,
        addressFilterIsNotEmpty,
      ],
      companyMockObjectMetadataItem.fields,
    );

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

    const phonesFilterContains: ObjectDropdownFilter = {
      id: 'person-phones-filter-contains',
      value: '1234567890',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '1234567890',
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'PHONES',
      },
    };

    const phonesFilterDoesNotContain: ObjectDropdownFilter = {
      id: 'person-phones-filter-does-not-contain',
      value: '1234567890',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '1234567890',
      operand: ViewFilterOperand.DoesNotContain,
      definition: {
        type: 'PHONES',
      },
    };

    const phonesFilterIsEmpty: ObjectDropdownFilter = {
      id: 'person-phones-filter-is-empty',
      value: '',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      definition: {
        type: 'PHONES',
      },
    };

    const phonesFilterIsNotEmpty: ObjectDropdownFilter = {
      id: 'person-phones-filter-is-not-empty',
      value: '',
      fieldMetadataId: personMockPhonesFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      definition: {
        type: 'PHONES',
      },
    };

    const result = turnObjectDropdownFilterIntoQueryFilter(
      [
        phonesFilterContains,
        phonesFilterDoesNotContain,
        phonesFilterIsEmpty,
        phonesFilterIsNotEmpty,
      ],
      personMockObjectMetadataItem.fields,
    );

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
                primaryPhoneCountryCode: {
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
            {
              not: {
                phones: {
                  primaryPhoneCountryCode: {
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
            {
              or: [
                {
                  phones: {
                    primaryPhoneCountryCode: {
                      is: 'NULL',
                    },
                  },
                },
                {
                  phones: {
                    primaryPhoneCountryCode: {
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
              {
                or: [
                  {
                    phones: {
                      primaryPhoneCountryCode: {
                        is: 'NULL',
                      },
                    },
                  },
                  {
                    phones: {
                      primaryPhoneCountryCode: {
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

    const emailsFilterContains: ObjectDropdownFilter = {
      id: 'person-emails-filter-contains',
      value: 'test@test.com',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: 'test@test.com',
      operand: ViewFilterOperand.Contains,
      definition: {
        type: 'EMAILS',
      },
    };

    const emailsFilterDoesNotContain: ObjectDropdownFilter = {
      id: 'person-emails-filter-does-not-contain',
      value: 'test@test.com',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: 'test@test.com',
      operand: ViewFilterOperand.DoesNotContain,
      definition: {
        type: 'EMAILS',
      },
    };

    const emailsFilterIsEmpty: ObjectDropdownFilter = {
      id: 'person-emails-filter-is-empty',
      value: '',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      definition: {
        type: 'EMAILS',
      },
    };

    const emailsFilterIsNotEmpty: ObjectDropdownFilter = {
      id: 'person-emails-filter-is-not-empty',
      value: '',
      fieldMetadataId: personMockEmailFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      definition: {
        type: 'EMAILS',
      },
    };

    const result = turnObjectDropdownFilterIntoQueryFilter(
      [
        emailsFilterContains,
        emailsFilterDoesNotContain,
        emailsFilterIsEmpty,
        emailsFilterIsNotEmpty,
      ],
      personMockObjectMetadataItem.fields,
    );

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

    const dateFilterIsAfter: ObjectDropdownFilter = {
      id: 'company-date-filter-is-after',
      value: '2024-09-17T20:46:58.922Z',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '2024-09-17T20:46:58.922Z',
      operand: ViewFilterOperand.IsAfter,
      definition: {
        type: 'DATE_TIME',
      },
    };

    const dateFilterIsBefore: ObjectDropdownFilter = {
      id: 'company-date-filter-is-before',
      value: '2024-09-17T20:46:58.922Z',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '2024-09-17T20:46:58.922Z',
      operand: ViewFilterOperand.IsBefore,
      definition: {
        type: 'DATE_TIME',
      },
    };

    const dateFilterIs: ObjectDropdownFilter = {
      id: 'company-date-filter-is',
      value: '2024-09-17T20:46:58.922Z',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '2024-09-17T20:46:58.922Z',
      operand: ViewFilterOperand.Is,
      definition: {
        type: 'DATE_TIME',
      },
    };

    const dateFilterIsRelative: ObjectDropdownFilter = {
      id: 'company-date-filter-relative',
      value: 'PAST_1_DAY',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: 'PAST_1_DAY',
      operand: ViewFilterOperand.IsRelative,
      definition: {
        type: 'DATE_TIME',
      },
    };

    const dateFilterIsEmpty: ObjectDropdownFilter = {
      id: 'company-date-filter-is-empty',
      value: '',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsEmpty,
      definition: {
        type: 'DATE_TIME',
      },
    };

    const dateFilterIsNotEmpty: ObjectDropdownFilter = {
      id: 'company-date-filter-is-not-empty',
      value: '',
      fieldMetadataId: companyMockDateFieldMetadataId?.id,
      displayValue: '',
      operand: ViewFilterOperand.IsNotEmpty,
      definition: {
        type: 'DATE_TIME',
      },
    };

    const result = turnObjectDropdownFilterIntoQueryFilter(
      [
        dateFilterIsAfter,
        dateFilterIsBefore,
        dateFilterIs,
        dateFilterIsRelative,
        dateFilterIsEmpty,
        dateFilterIsNotEmpty,
      ],
      companyMockObjectMetadataItem.fields,
    );

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
                lte: '2024-09-17T21:59:59.999Z',
              },
            },
            {
              createdAt: {
                gte: '2024-09-16T22:00:00.000Z',
              },
            },
          ],
        },
        {
          and: [
            {
              createdAt: {
                gte: '2019-12-31T00:00:00.000Z',
              },
            },
            {
              createdAt: {
                lte: '2020-01-01T00:00:00.000Z',
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
});
