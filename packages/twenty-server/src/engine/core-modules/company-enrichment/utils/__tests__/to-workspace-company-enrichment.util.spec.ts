import { WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-max-tags.constant';
import { WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-summary-max-length.constant';
import { toWorkspaceCompanyEnrichment } from 'src/engine/core-modules/company-enrichment/utils/to-workspace-company-enrichment.util';

describe('toWorkspaceCompanyEnrichment', () => {
  const domain = 'acme.com';
  const enrichedAt = new Date('2026-07-21T10:00:00.000Z');

  it('should cap the summary at the maximum length', () => {
    const result = toWorkspaceCompanyEnrichment({
      domain,
      enrichedAt,
      data: {
        summary: 'a'.repeat(
          WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH + 1,
        ),
      },
    });

    expect(result.summary).toHaveLength(
      WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH,
    );
  });

  it('should cap the tags at the maximum count', () => {
    const result = toWorkspaceCompanyEnrichment({
      domain,
      enrichedAt,
      data: {
        tags: Array.from({ length: 12 }, (_, index) => `tag-${index}`),
      },
    });

    expect(result.tags).toHaveLength(WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS);
  });

  it('should prefer display_name over name', () => {
    const result = toWorkspaceCompanyEnrichment({
      domain,
      enrichedAt,
      data: { name: 'acme inc', display_name: 'Acme Inc' },
    });

    expect(result.name).toBe('Acme Inc');
  });

  it('should fall back to name when display_name is empty', () => {
    const result = toWorkspaceCompanyEnrichment({
      domain,
      enrichedAt,
      data: { name: 'acme inc', display_name: '' },
    });

    expect(result.name).toBe('acme inc');
  });

  it('should flatten the location', () => {
    const result = toWorkspaceCompanyEnrichment({
      domain,
      enrichedAt,
      data: {
        location: {
          locality: 'San Francisco',
          region: 'California',
          country: 'United States',
        },
      },
    });

    expect(result).toMatchObject({
      locality: 'San Francisco',
      region: 'California',
      country: 'United States',
    });
  });

  it('should null every absent field and keep tags an empty array', () => {
    const result = toWorkspaceCompanyEnrichment({
      domain,
      enrichedAt,
      data: {},
    });

    expect(result).toEqual({
      domain,
      enrichedAt: enrichedAt.toISOString(),
      name: null,
      website: null,
      industry: null,
      employeeCount: null,
      size: null,
      founded: null,
      headline: null,
      summary: null,
      tags: [],
      locality: null,
      region: null,
      country: null,
    });
  });
});
