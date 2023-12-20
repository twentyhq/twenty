import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockObjectMetadataItem } from '~/testing/mock-data/objectMetadataItems';

import { isRecordMatchingFilter } from './isRecordMatchingFilter';

describe('isRecordMatchingFilter', () => {
  describe('Empty Filters', () => {
    it('matches any record when no filter is provided', () => {
      const emptyFilter = {};

      mockedCompaniesData.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter: emptyFilter,
            objectMetadataItem: mockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });

    it('matches any record when filter fields are empty', () => {
      const filterWithEmptyFields = {
        name: {},
        employees: {},
      };

      mockedCompaniesData.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter: filterWithEmptyFields,
            objectMetadataItem: mockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });

    it('matches any record with an empty and filter', () => {
      const filter = { and: [] };

      mockedCompaniesData.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter,
            objectMetadataItem: mockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });

    it('matches any record with an empty or filter', () => {
      const filter = { or: [] };

      mockedCompaniesData.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter,
            objectMetadataItem: mockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });

    it('matches any record with an empty not filter', () => {
      const filter = { not: {} };

      mockedCompaniesData.forEach((company) => {
        expect(
          isRecordMatchingFilter({
            record: company,
            filter,
            objectMetadataItem: mockObjectMetadataItem,
          }),
        ).toBe(true);
      });
    });
  });

  describe('Simple Filters', () => {
    it('matches a record with a simple equality filter on name', () => {
      const filter = { name: { eq: 'Airbnb' } };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[0],
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[1],
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches a record with a simple equality filter on domainName', () => {
      const filter = { domainName: { eq: 'airbnb.com' } };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[0],
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true);
      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[1],
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches a record with a greater than filter on employees', () => {
      const filter = { employees: { gt: 10 } };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[0],
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true);
      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[1],
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches a record with a boolean filter on idealCustomerProfile', () => {
      const filter = { idealCustomerProfile: { eq: true } };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[0],
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true);
      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[4], // Assuming this record has idealCustomerProfile as false
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false);
    });
  });

  describe('Complex And/Or/Not Nesting', () => {
    it('matches record with a combination of and + or filters', () => {
      const filter: ObjectRecordQueryFilter = {
        and: [
          { domainName: { eq: 'airbnb.com' } },
          {
            or: [
              { employees: { gt: 10 } },
              { idealCustomerProfile: { eq: true } },
            ],
          },
        ],
      };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[0], // Airbnb
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[1], // Aircall
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches record with nested not filter', () => {
      const filter: ObjectRecordQueryFilter = {
        not: {
          and: [
            { name: { eq: 'Airbnb' } },
            { idealCustomerProfile: { eq: true } },
          ],
        },
      };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[0], // Airbnb
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false); // Should not match as it's Airbnb with idealCustomerProfile true

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[3], // Apple
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true); // Should match as it's not Airbnb
    });

    it('matches record with deep nesting of and, or, and not filters', () => {
      const filter: ObjectRecordQueryFilter = {
        and: [
          { domainName: { eq: 'apple.com' } },
          {
            or: [{ employees: { eq: 10 } }, { not: { name: { eq: 'Apple' } } }],
          },
        ],
      };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[3], // Apple
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[4], // Qonto
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches record with and filter at root level', () => {
      const filter: ObjectRecordQueryFilter = {
        and: [
          { name: { eq: 'Facebook' } },
          { idealCustomerProfile: { eq: true } },
        ],
      };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[5], // Facebook
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[0], // Airbnb
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false);
    });

    it('matches record with or filter at root level including a not condition', () => {
      const filter: ObjectRecordQueryFilter = {
        or: [{ name: { eq: 'Sequoia' } }, { not: { employees: { eq: 1 } } }],
      };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[6], // Sequoia
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[1], // Aircall
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false);
    });
  });

  describe('Implicit And Conditions', () => {
    it('matches record with implicit and of multiple operators within the same field', () => {
      const filter = {
        employees: { gt: 10, lt: 100000 },
        name: { eq: 'Airbnb' },
      };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[0], // Airbnb
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true); // Matches as Airbnb's employee count is between 10 and 100000

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[1], // Aircall
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false); // Does not match as Aircall's employee count is not within the range
    });

    it('matches record with implicit and within an object passed to or', () => {
      const filter = {
        or: {
          name: { eq: 'Airbnb' },
          domainName: { eq: 'airbnb.com' },
        },
      };

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[0], // Airbnb
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: mockedCompaniesData[2], // Algolia
          filter,
          objectMetadataItem: mockObjectMetadataItem,
        }),
      ).toBe(false);
    });
  });
});
