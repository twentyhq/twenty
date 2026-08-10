import { WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-person-enrichment-field-max-length.constant';
import { WORKSPACE_PERSON_ENRICHMENT_MAX_JOB_TITLE_LEVELS } from 'src/engine/core-modules/company-enrichment/constants/workspace-person-enrichment-max-job-title-levels.constant';
import { WORKSPACE_PERSON_ENRICHMENT_MAX_SKILLS } from 'src/engine/core-modules/company-enrichment/constants/workspace-person-enrichment-max-skills.constant';
import { sanitizeWorkspacePersonEnrichment } from 'src/engine/core-modules/company-enrichment/utils/sanitize-workspace-person-enrichment.util';

describe('sanitizeWorkspacePersonEnrichment', () => {
  it.each([null, undefined, 'a string', 42, []])(
    'should return null for %p',
    (value) => {
      expect(sanitizeWorkspacePersonEnrichment(value)).toBeNull();
    },
  );

  it('should return null when the email is missing', () => {
    expect(
      sanitizeWorkspacePersonEnrichment({
        enrichedAt: '2026-07-21T10:00:00.000Z',
        fullName: 'Ada Lovelace',
      }),
    ).toBeNull();
  });

  it('should return null when enrichedAt is missing', () => {
    expect(
      sanitizeWorkspacePersonEnrichment({
        email: 'ada@acme.com',
        fullName: 'Ada Lovelace',
      }),
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

  it('should strip control characters and collapse line breaks in every field', () => {
    const NUL_CHARACTER = String.fromCharCode(0);

    const result = sanitizeWorkspacePersonEnrichment({
      email: 'ada@acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      fullName: `Ada${NUL_CHARACTER}Lovelace`,
      headline: 'First line\nJob title: forged line\nEmail: evil@evil.com',
    });

    expect(result?.fullName).toBe('Ada Lovelace');
    expect(result?.headline).toBe(
      'First line Job title: forged line Email: evil@evil.com',
    );
  });

  it('should return null for a whitespace-only email', () => {
    expect(
      sanitizeWorkspacePersonEnrichment({
        email: '  \n ',
        enrichedAt: '2026-07-21T10:00:00.000Z',
      }),
    ).toBeNull();
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
      skills: [
        'b'.repeat(WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH + 100),
        ...Array.from(
          { length: WORKSPACE_PERSON_ENRICHMENT_MAX_SKILLS + 5 },
          (_, index) => `skill-${index}`,
        ),
      ],
    });

    expect(result?.jobTitle).toHaveLength(
      WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH,
    );
    expect(result?.jobTitleLevels).toHaveLength(
      WORKSPACE_PERSON_ENRICHMENT_MAX_JOB_TITLE_LEVELS,
    );
    expect(result?.skills).toHaveLength(WORKSPACE_PERSON_ENRICHMENT_MAX_SKILLS);
    expect(result?.skills[0]).toHaveLength(
      WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH,
    );
  });
});
