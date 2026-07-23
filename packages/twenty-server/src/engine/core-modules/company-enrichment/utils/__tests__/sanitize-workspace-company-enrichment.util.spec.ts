import { WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-field-max-length.constant';
import { WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-max-tags.constant';
import { WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-summary-max-length.constant';
import { sanitizeWorkspaceCompanyEnrichment } from 'src/engine/core-modules/company-enrichment/utils/sanitize-workspace-company-enrichment.util';

describe('sanitizeWorkspaceCompanyEnrichment', () => {
  it.each([null, undefined, 'a string', 42, []])(
    'should return null for %p',
    (value) => {
      expect(sanitizeWorkspaceCompanyEnrichment(value)).toBeNull();
    },
  );

  it('should return null when the domain is missing', () => {
    expect(
      sanitizeWorkspaceCompanyEnrichment({
        enrichedAt: '2026-07-21T10:00:00.000Z',
        name: 'Acme Inc',
      }),
    ).toBeNull();
  });

  it('should return null when enrichedAt is missing', () => {
    expect(
      sanitizeWorkspaceCompanyEnrichment({
        domain: 'acme.com',
        name: 'Acme Inc',
      }),
    ).toBeNull();
  });

  it('should keep only the known fields with valid types', () => {
    const result = sanitizeWorkspaceCompanyEnrichment({
      domain: 'acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      name: 'Acme Inc',
      website: 'https://acme.com',
      industry: { nested: 'object' },
      employeeCount: '250',
      size: '51-200',
      founded: 2012,
      headline: null,
      summary: 'Rocket powered anvils',
      tags: ['anvils', 42, 'rockets'],
      locality: 'San Francisco',
      region: 'California',
      country: 'United States',
      injectedField: 'ignore me',
    });

    expect(result).toEqual({
      domain: 'acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      name: 'Acme Inc',
      website: 'https://acme.com',
      industry: null,
      employeeCount: null,
      size: '51-200',
      founded: 2012,
      headline: null,
      summary: 'Rocket powered anvils',
      tags: ['anvils', 'rockets'],
      locality: 'San Francisco',
      region: 'California',
      country: 'United States',
    });
  });

  it('should keep numeric counts', () => {
    const result = sanitizeWorkspaceCompanyEnrichment({
      domain: 'acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      employeeCount: 250,
      founded: 2012,
    });

    expect(result?.employeeCount).toBe(250);
    expect(result?.founded).toBe(2012);
  });

  it('should cap oversized fields', () => {
    const result = sanitizeWorkspaceCompanyEnrichment({
      domain: 'acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      name: 'a'.repeat(WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH + 100),
      summary: 'b'.repeat(
        WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH + 100,
      ),
      tags: [
        'c'.repeat(WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH + 100),
        ...Array.from({ length: 20 }, (_, index) => `tag-${index}`),
      ],
    });

    expect(result?.name).toHaveLength(
      WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH,
    );
    expect(result?.summary).toHaveLength(
      WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH,
    );
    expect(result?.tags).toHaveLength(WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS);
    expect(result?.tags[0]).toHaveLength(
      WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH,
    );
  });
});
