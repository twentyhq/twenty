import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { isCompanyEnrichmentFinal } from 'src/engine/core-modules/getting-started/utils/is-company-enrichment-final.util';

const COMPANY_ENRICHMENT: WorkspaceCompanyEnrichment = {
  domain: 'acme.com',
  enrichedAt: '2026-10-29T12:00:00.000Z',
  name: 'Acme',
  website: 'acme.com',
  industry: 'computer software',
  employeeCount: 8,
  size: null,
  founded: null,
  headline: null,
  summary: null,
  tags: [],
  locality: null,
  region: null,
  country: null,
};

describe('isCompanyEnrichmentFinal', () => {
  it('should not be final before any attempt', () => {
    expect(
      isCompanyEnrichmentFinal({
        companyEnrichment: null,
        companyEnrichmentAttempt: null,
      }),
    ).toBe(false);
  });

  it('should not be final after a transient error', () => {
    expect(
      isCompanyEnrichmentFinal({
        companyEnrichment: null,
        companyEnrichmentAttempt: { outcome: 'transientError' },
      }),
    ).toBe(false);
  });

  it('should not be final when a match has no stored result yet', () => {
    expect(
      isCompanyEnrichmentFinal({
        companyEnrichment: null,
        companyEnrichmentAttempt: { outcome: 'matched' },
      }),
    ).toBe(false);
  });

  it('should be final when a match has its stored result', () => {
    expect(
      isCompanyEnrichmentFinal({
        companyEnrichment: COMPANY_ENRICHMENT,
        companyEnrichmentAttempt: { outcome: 'matched' },
      }),
    ).toBe(true);
  });

  it.each(['notFound', 'permanentError'] as const)(
    'should be final after a %s outcome',
    (outcome) => {
      expect(
        isCompanyEnrichmentFinal({
          companyEnrichment: null,
          companyEnrichmentAttempt: { outcome },
        }),
      ).toBe(true);
    },
  );
});
