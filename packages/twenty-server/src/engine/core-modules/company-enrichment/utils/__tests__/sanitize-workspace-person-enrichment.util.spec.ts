import { WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-person-enrichment-field-max-length.constant';
import { WORKSPACE_PERSON_ENRICHMENT_MAX_JOB_TITLE_LEVELS } from 'src/engine/core-modules/company-enrichment/constants/workspace-person-enrichment-max-job-title-levels.constant';
import { WORKSPACE_PERSON_ENRICHMENT_MAX_SKILLS } from 'src/engine/core-modules/company-enrichment/constants/workspace-person-enrichment-max-skills.constant';
import { sanitizeWorkspacePersonEnrichment } from 'src/engine/core-modules/company-enrichment/utils/sanitize-workspace-person-enrichment.util';

describe('sanitizeWorkspacePersonEnrichment', () => {
  it('should return null for a non-object payload', () => {
    expect(sanitizeWorkspacePersonEnrichment(42)).toBeNull();
  });

  it('should return null when the email or enrichedAt is missing', () => {
    expect(
      sanitizeWorkspacePersonEnrichment({
        enrichedAt: '2026-07-21T10:00:00.000Z',
      }),
    ).toBeNull();
    expect(
      sanitizeWorkspacePersonEnrichment({ email: 'ada@acme.com' }),
    ).toBeNull();
  });

  it('should keep only the known fields with valid types', () => {
    const result = sanitizeWorkspacePersonEnrichment({
      email: 'ada@acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      fullName: 'Ada Lovelace',
      jobTitle: 'Head of Sales',
      jobTitleLevels: ['director', 42],
      jobCompanyName: 'Acme Inc',
      industry: { nested: 'object' },
      headline: null,
      linkedinUrl: 'linkedin.com/in/ada',
      skills: ['sales', 42, 'negotiation'],
      locality: 'Paris',
      region: 'Ile-de-France',
      country: 'France',
      injectedField: 'ignore me',
    });

    expect(result).toEqual({
      email: 'ada@acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      fullName: 'Ada Lovelace',
      jobTitle: 'Head of Sales',
      jobTitleLevels: ['director'],
      jobCompanyName: 'Acme Inc',
      industry: null,
      headline: null,
      linkedinUrl: 'linkedin.com/in/ada',
      skills: ['sales', 'negotiation'],
      locality: 'Paris',
      region: 'Ile-de-France',
      country: 'France',
    });
  });

  it('should cap oversized fields and arrays', () => {
    const result = sanitizeWorkspacePersonEnrichment({
      email: 'ada@acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      jobTitle: 'a'.repeat(WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH + 100),
      jobTitleLevels: Array.from(
        { length: WORKSPACE_PERSON_ENRICHMENT_MAX_JOB_TITLE_LEVELS + 5 },
        (_, index) => `level-${index}`,
      ),
      skills: Array.from(
        { length: WORKSPACE_PERSON_ENRICHMENT_MAX_SKILLS + 5 },
        (_, index) => `skill-${index}`,
      ),
    });

    expect(result?.jobTitle).toHaveLength(
      WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH,
    );
    expect(result?.jobTitleLevels).toHaveLength(
      WORKSPACE_PERSON_ENRICHMENT_MAX_JOB_TITLE_LEVELS,
    );
    expect(result?.skills).toHaveLength(WORKSPACE_PERSON_ENRICHMENT_MAX_SKILLS);
  });
});
