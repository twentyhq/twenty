import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { getGettingStartedProfile } from 'src/engine/core-modules/getting-started/utils/get-getting-started-profile.util';

const buildCompanyEnrichment = (
  employeeCount: number | null,
): WorkspaceCompanyEnrichment => ({
  domain: 'acme.com',
  enrichedAt: '2026-10-29T12:00:00.000Z',
  name: 'Acme',
  website: 'acme.com',
  industry: 'computer software',
  employeeCount,
  size: null,
  founded: null,
  headline: null,
  summary: null,
  tags: [],
  locality: null,
  region: null,
  country: null,
});

describe('getGettingStartedProfile', () => {
  it.each([
    {
      description: 'a personal email, whatever the enrichment',
      userEmail: 'jane@gmail.com',
      companyEnrichment: buildCompanyEnrichment(500),
      expected: 'PERSONAL',
    },
    {
      description: 'a work email at a company of 10 people',
      userEmail: 'jane@acme.com',
      companyEnrichment: buildCompanyEnrichment(10),
      expected: 'SMALL_TEAM',
    },
    {
      description: 'a work email at a company of 11 people',
      userEmail: 'jane@acme.com',
      companyEnrichment: buildCompanyEnrichment(11),
      expected: 'TEAM',
    },
    {
      description: 'a work email without an employee count',
      userEmail: 'jane@acme.com',
      companyEnrichment: buildCompanyEnrichment(null),
      expected: 'TEAM',
    },
    {
      description: 'a work email without enrichment',
      userEmail: 'jane@acme.com',
      companyEnrichment: null,
      expected: 'TEAM',
    },
  ])(
    'should pick $expected for $description',
    ({ userEmail, companyEnrichment, expected }) => {
      expect(getGettingStartedProfile({ userEmail, companyEnrichment })).toBe(
        expected,
      );
    },
  );
});
