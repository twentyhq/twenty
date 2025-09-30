import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

import { type Company } from '@/companies/types/Company';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';

const companiesMock = getCompaniesMock();

const companyMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'company',
)!;

describe('isRecordMatchingFilter', () => {
  describe('Empty Filters', () => {
    it('matches any record when no filter is provided', () => {
      const emptyFilter = {};

      companiesMock.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter: emptyFilter,
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });

    it('matches any record when filter fields are empty', () => {
      const filterWithEmptyFields = {
        name: {},
        employees: {},
      };

      companiesMock.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter: filterWithEmptyFields,
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });

    it('matches any record with an empty and filter', () => {
      const filter = { and: [] };

      companiesMock.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter,
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });

    it('matches any record with an empty or filter', () => {
      const filter = { or: [] };

      companiesMock.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter,
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });

    it('matches any record with an empty not filter', () => {
      const filter = { not: {} };

      companiesMock.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter,
            objectMetadataItem: companyMockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });
  });

  describe('Simple Filters', () => {
    it('matches a record with a simple equality filter on name', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        name: companyMockInFilter.name + 'Different',
      };

      const filter = { name: { eq: companyMockInFilter.name } };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches a record with a simple equality filter on domainName', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        domainName: {
          primaryLinkUrl:
            getCompanyDomainName(companyMockInFilter as Company) + 'Different',
        },
      };

      const filter = {
        domainName: {
          primaryLinkUrl: {
            eq: getCompanyDomainName(companyMockInFilter as Company),
          },
        },
      };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true);
      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches a record with a greater than filter on employees', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
        employees: 100,
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        employees: companyMockInFilter.employees - 50,
      };

      const filter = {
        employees: { gt: companyMockInFilter.employees - 1 },
      };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches a record with a boolean filter on idealCustomerProfile', () => {
      const companyIdealCustomerProfileTrue = {
        ...companiesMock[0],
        idealCustomerProfile: true,
      };

      const companyIdealCustomerProfileFalse = {
        ...companiesMock[0],
        idealCustomerProfile: false,
      };

      const filter = {
        idealCustomerProfile: {
          eq: companyIdealCustomerProfileTrue.idealCustomerProfile,
        },
      };

      expect(
        isRecordMatchingFilter({
          record: companyIdealCustomerProfileTrue,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(companyIdealCustomerProfileTrue.idealCustomerProfile);
      expect(
        isRecordMatchingFilter({
          record: companyIdealCustomerProfileFalse,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(companyIdealCustomerProfileFalse.idealCustomerProfile);
    });
  });

  describe('Complex And/Or/Not Nesting', () => {
    it('matches record with a combination of and + or filters', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: true,
        employees: 100,
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: false,
        employees: 0,
      };

      const filter: RecordGqlOperationFilter = {
        and: [
          {
            domainName: {
              primaryLinkUrl: {
                eq: getCompanyDomainName(companyMockInFilter as Company),
              },
            },
          },
          {
            or: [
              {
                employees: {
                  gt: companyMockInFilter.employees - 1,
                },
              },
              {
                idealCustomerProfile: {
                  eq: companyMockInFilter.idealCustomerProfile,
                },
              },
            ],
          },
        ],
      };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches record with nested not filter', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: true,
        employees: 100,
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: false,
        name: companyMockInFilter.name + 'Different',
      };

      const filter: RecordGqlOperationFilter = {
        not: {
          and: [
            { name: { eq: companyMockInFilter.name } },
            {
              idealCustomerProfile: {
                eq: companyMockInFilter.idealCustomerProfile,
              },
            },
          ],
        },
      };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true);
    });

    it('matches record with deep nesting of and, or, and not filters', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: true,
        employees: 100,
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        domainName: {
          primaryLinkUrl:
            getCompanyDomainName(companyMockInFilter as Company) + 'Different',
        },
        employees: 5,
        name: companyMockInFilter.name + 'Different',
      };

      const filter: RecordGqlOperationFilter = {
        and: [
          {
            domainName: {
              primaryLinkUrl: {
                eq: getCompanyDomainName(companyMockInFilter as Company),
              },
            },
          },
          {
            or: [
              { employees: { eq: companyMockInFilter.employees } },
              { not: { name: { eq: companyMockInFilter.name } } },
            ],
          },
        ],
      };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches record with and filter at root level', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: true,
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: false,
        name: companyMockInFilter.name + 'Different',
      };

      const filter: RecordGqlOperationFilter = {
        and: [
          { name: { eq: companyMockInFilter.name } },
          {
            idealCustomerProfile: {
              eq: companyMockInFilter.idealCustomerProfile,
            },
          },
        ],
      };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches record with or filter at root level including a not condition', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: true,
        employees: 100,
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: false,
        name: companyMockInFilter.name + 'Different',
        employees: companyMockInFilter.employees - 1,
      };

      const filter: RecordGqlOperationFilter = {
        or: [
          { name: { eq: companyMockInFilter.name } },
          { not: { employees: { eq: companyMockInFilter.employees - 1 } } },
        ],
      };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false);
    });
  });

  describe('Implicit And Conditions', () => {
    it('matches record with implicit and of multiple operators within the same field', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: true,
        employees: 100,
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        idealCustomerProfile: false,
        name: companyMockInFilter.name + 'Different',
        employees: companyMockInFilter.employees + 100,
      };

      const filter = {
        employees: {
          gt: companyMockInFilter.employees - 10,
          lt: companyMockInFilter.employees + 10,
        },
        name: { eq: companyMockInFilter.name },
      };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true); // Matches as Airbnb's employee count is between 10 and 100000

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false); // Does not match as Aircall's employee count is not within the range
    });

    it('matches record with implicit and within an object passed to or', () => {
      const companyMockInFilter = {
        ...companiesMock[0],
      };

      const companyMockNotInFilter = {
        ...companiesMock[0],
        name: companyMockInFilter.name + 'Different',
        domainName: { primaryLinkUrl: companyMockInFilter.name + 'Different' },
      };

      const filter = {
        or: {
          name: { eq: companyMockInFilter.name },
          domainName: {
            primaryLinkUrl: {
              eq: getCompanyDomainName(companyMockInFilter as Company),
            },
          },
        },
      };

      expect(
        isRecordMatchingFilter({
          record: companyMockInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
        }),
      ).toBe(false);
    });
  });
});
