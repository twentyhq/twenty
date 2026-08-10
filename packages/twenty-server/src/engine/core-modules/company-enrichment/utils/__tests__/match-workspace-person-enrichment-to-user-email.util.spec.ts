import { type WorkspacePersonEnrichment } from 'twenty-shared/workspace';

import { matchWorkspacePersonEnrichmentToUserEmail } from 'src/engine/core-modules/company-enrichment/utils/match-workspace-person-enrichment-to-user-email.util';

const personEnrichment = {
  email: 'ada@acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
} as WorkspacePersonEnrichment;

describe('matchWorkspacePersonEnrichmentToUserEmail', () => {
  it('should keep an enrichment whose email matches the user email', () => {
    expect(
      matchWorkspacePersonEnrichmentToUserEmail({
        personEnrichment,
        userEmail: 'ada@acme.com',
      }),
    ).toBe(personEnrichment);
  });

  it('should match case-insensitively and ignore surrounding whitespace', () => {
    expect(
      matchWorkspacePersonEnrichmentToUserEmail({
        personEnrichment,
        userEmail: '  Ada@ACME.com ',
      }),
    ).toBe(personEnrichment);
  });

  it('should drop an enrichment belonging to another email', () => {
    expect(
      matchWorkspacePersonEnrichmentToUserEmail({
        personEnrichment,
        userEmail: 'someone-else@acme.com',
      }),
    ).toBeNull();
  });

  it('should pass through a null enrichment', () => {
    expect(
      matchWorkspacePersonEnrichmentToUserEmail({
        personEnrichment: null,
        userEmail: 'ada@acme.com',
      }),
    ).toBeNull();
  });
});
