import { toWorkspacePersonEnrichment } from 'src/engine/core-modules/company-enrichment/utils/to-workspace-person-enrichment.util';

describe('toWorkspacePersonEnrichment', () => {
  const enrichedAt = new Date('2026-07-21T10:00:00.000Z');

  it('should map the People Data Labs fields onto the workspace shape', () => {
    const result = toWorkspacePersonEnrichment({
      email: 'ada@acme.com',
      enrichedAt,
      data: {
        full_name: 'Ada Lovelace',
        job_title: 'head of sales',
        job_title_levels: ['director'],
        job_company_name: 'Acme Inc',
        industry: 'computer software',
        headline: 'Selling anvils at scale',
        linkedin_url: 'linkedin.com/in/ada',
        skills: ['sales'],
        location_locality: 'paris',
        location_region: 'ile-de-france',
        location_country: 'france',
      },
    });

    expect(result).toEqual({
      email: 'ada@acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      fullName: 'Ada Lovelace',
      jobTitle: 'head of sales',
      jobTitleLevels: ['director'],
      jobCompanyName: 'Acme Inc',
      industry: 'computer software',
      headline: 'Selling anvils at scale',
      linkedinUrl: 'linkedin.com/in/ada',
      skills: ['sales'],
      locality: 'paris',
      region: 'ile-de-france',
      country: 'france',
    });
  });

  it('should fall back to the job company industry when the person has none', () => {
    const result = toWorkspacePersonEnrichment({
      email: 'ada@acme.com',
      enrichedAt,
      data: { job_company_industry: 'manufacturing' },
    });

    expect(result?.industry).toBe('manufacturing');
  });
});
