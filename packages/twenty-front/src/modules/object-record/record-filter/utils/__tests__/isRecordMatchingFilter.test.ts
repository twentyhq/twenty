import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

import { type Company } from '@/companies/types/Company';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';

const companiesMock = mockedCompanyRecords.map((record) =>
  getRecordFromRecordNode<Company>({ recordNode: record }),
);

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const companyMockObjectMetadataItem = objectMetadataItems.find(
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
            objectMetadataItems,
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
            objectMetadataItems,
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
            objectMetadataItems,
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
            objectMetadataItems,
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
            objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(true);
      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(companyIdealCustomerProfileTrue.idealCustomerProfile);
      expect(
        isRecordMatchingFilter({
          record: companyIdealCustomerProfileFalse,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(false);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(true); // Matches as Airbnb's employee count is between 10 and 100000

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
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
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyMockNotInFilter,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });
  });

  describe('Relation Filters', () => {
    const accountOwnerId = '20202020-0687-4c41-b707-ed1bfca972a7';

    const companyWithAccountOwner = {
      ...companiesMock[0],
      accountOwner: { id: accountOwnerId },
      accountOwnerId,
    };

    const companyWithoutAccountOwner = {
      ...companyWithAccountOwner,
      accountOwner: null,
      accountOwnerId: null,
    };

    it('matches "is not empty" on a relation field by its related record id', () => {
      const filter: RecordGqlOperationFilter = {
        accountOwner: { is: 'NOT_NULL' },
      };

      expect(
        isRecordMatchingFilter({
          record: companyWithAccountOwner,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyWithoutAccountOwner,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('matches "is empty" on a relation field by its related record id', () => {
      const filter: RecordGqlOperationFilter = {
        accountOwner: { is: 'NULL' },
      };

      expect(
        isRecordMatchingFilter({
          record: companyWithoutAccountOwner,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyWithAccountOwner,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('matches an "in" filter on a relation field by its related record id', () => {
      expect(
        isRecordMatchingFilter({
          record: companyWithAccountOwner,
          filter: { accountOwner: { in: [accountOwnerId] } },
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: companyWithAccountOwner,
          filter: { accountOwner: { in: ['unknown-id'] } },
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('still matches the relation join column field', () => {
      const filter: RecordGqlOperationFilter = {
        accountOwnerId: { is: 'NOT_NULL' },
      };

      expect(
        isRecordMatchingFilter({
          record: companyWithAccountOwner,
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);
    });
  });

  describe('Nested Relation Filters', () => {
    const opportunityMockObjectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === 'opportunity',
    )!;

    const companyId = '20202020-171e-4bcc-9cf7-43448d6fb278';
    const personId = '20202020-2d40-4e49-8df4-9c6a049190ef';

    const opportunityWithPointOfContact = {
      id: '20202020-83f4-4c4f-95c1-b7be9f2d36d1',
      pointOfContact: { id: personId, companyId },
    };

    it('matches when the related record satisfies the nested filter', () => {
      const filter = {
        pointOfContact: { companyId: { in: [companyId] } },
      } as RecordGqlOperationFilter;

      expect(
        isRecordMatchingFilter({
          record: opportunityWithPointOfContact,
          filter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);
    });

    it('does not match when the related record fails the nested filter', () => {
      const filter = {
        pointOfContact: {
          companyId: { in: ['20202020-0000-4000-8000-000000000000'] },
        },
      } as RecordGqlOperationFilter;

      expect(
        isRecordMatchingFilter({
          record: opportunityWithPointOfContact,
          filter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('does not match when the related record is not loaded', () => {
      const filter = {
        pointOfContact: { companyId: { in: [companyId] } },
      } as RecordGqlOperationFilter;

      expect(
        isRecordMatchingFilter({
          record: {
            ...opportunityWithPointOfContact,
            pointOfContact: null,
          },
          filter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);

      expect(
        isRecordMatchingFilter({
          record: { id: opportunityWithPointOfContact.id },
          filter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('matches a to-many relation when any loaded related record satisfies the nested filter', () => {
      const personMockObjectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === 'person',
      )!;

      const filter = {
        pointOfContactForOpportunities: {
          id: { eq: opportunityWithPointOfContact.id },
        },
      } as RecordGqlOperationFilter;

      const personWithOpportunities = {
        id: personId,
        pointOfContactForOpportunities: [
          { id: '20202020-0000-4000-8000-000000000001' },
          { id: opportunityWithPointOfContact.id },
        ],
      };

      expect(
        isRecordMatchingFilter({
          record: personWithOpportunities,
          filter,
          objectMetadataItem: personMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: {
            ...personWithOpportunities,
            pointOfContactForOpportunities: [],
          },
          filter,
          objectMetadataItem: personMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('matches a to-many relation held as a connection, the way records reach the optimistic effects', () => {
      const personMockObjectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === 'person',
      )!;

      const filter = {
        pointOfContactForOpportunities: {
          id: { eq: opportunityWithPointOfContact.id },
        },
      } as RecordGqlOperationFilter;

      const buildPersonWithOpportunityConnection = (
        opportunityIds: string[],
      ) => ({
        id: personId,
        pointOfContactForOpportunities: {
          __typename: 'OpportunityConnection',
          edges: opportunityIds.map((id) => ({
            __typename: 'OpportunityEdge',
            node: { id },
          })),
        },
      });

      expect(
        isRecordMatchingFilter({
          record: buildPersonWithOpportunityConnection([
            '20202020-0000-4000-8000-000000000001',
            opportunityWithPointOfContact.id,
          ]),
          filter,
          objectMetadataItem: personMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: buildPersonWithOpportunityConnection([]),
          filter,
          objectMetadataItem: personMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);

      expect(
        isRecordMatchingFilter({
          record: { id: personId },
          filter,
          objectMetadataItem: personMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('reads a join column filter from the related record when the column is not loaded', () => {
      const personMockObjectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === 'person',
      )!;

      const filter = {
        pointOfContactForOpportunities: {
          pointOfContactId: { in: [personId] },
        },
      } as RecordGqlOperationFilter;

      const buildPersonWithOpportunityPointOfContact = (
        pointOfContact: { id: string } | null,
      ) => ({
        id: personId,
        pointOfContactForOpportunities: [
          { id: opportunityWithPointOfContact.id, pointOfContact },
        ],
      });

      expect(
        isRecordMatchingFilter({
          record: buildPersonWithOpportunityPointOfContact({ id: personId }),
          filter,
          objectMetadataItem: personMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: buildPersonWithOpportunityPointOfContact(null),
          filter,
          objectMetadataItem: personMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('evaluates composite conditions against the related record', () => {
      const filter = {
        pointOfContact: {
          and: [{ companyId: { in: [companyId] } }, { id: { eq: personId } }],
        },
      } as RecordGqlOperationFilter;

      expect(
        isRecordMatchingFilter({
          record: opportunityWithPointOfContact,
          filter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);

      const nonMatchingFilter = {
        pointOfContact: {
          and: [{ companyId: { in: [companyId] } }, { id: { neq: personId } }],
        },
      } as RecordGqlOperationFilter;

      expect(
        isRecordMatchingFilter({
          record: opportunityWithPointOfContact,
          filter: nonMatchingFilter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('keeps a record with an unloaded relation out of a negated nested filter', () => {
      const filter = {
        not: { pointOfContact: { companyId: { in: [companyId] } } },
      } as RecordGqlOperationFilter;

      expect(
        isRecordMatchingFilter({
          record: { id: opportunityWithPointOfContact.id },
          filter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });

    it('evaluates a negated nested filter truthfully on a loaded relation', () => {
      const filter = {
        not: { pointOfContact: { companyId: { in: [companyId] } } },
      } as RecordGqlOperationFilter;

      expect(
        isRecordMatchingFilter({
          record: opportunityWithPointOfContact,
          filter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);

      expect(
        isRecordMatchingFilter({
          record: {
            ...opportunityWithPointOfContact,
            pointOfContact: {
              id: personId,
              companyId: '20202020-0000-4000-8000-000000000000',
            },
          },
          filter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: {
            ...opportunityWithPointOfContact,
            pointOfContact: null,
          },
          filter,
          objectMetadataItem: opportunityMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);
    });

    it('matches a nested filter on a list of related records when one of them satisfies it', () => {
      const filter = {
        people: { id: { eq: personId } },
      } as RecordGqlOperationFilter;

      expect(
        isRecordMatchingFilter({
          record: {
            ...companiesMock[0],
            people: [{ id: personId }],
          },
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(true);

      expect(
        isRecordMatchingFilter({
          record: {
            ...companiesMock[0],
            people: [{ id: '20202020-0000-4000-8000-000000000001' }],
          },
          filter,
          objectMetadataItem: companyMockObjectMetadataItem,
          objectMetadataItems,
        }),
      ).toBe(false);
    });
  });
});
