import { type WorkspacePersonEnrichment } from 'twenty-shared/workspace';

import { matchWorkspacePersonEnrichmentToUserEmail } from 'src/engine/core-modules/company-enrichment/utils/match-workspace-person-enrichment-to-user-email.util';

const personEnrichment = {
  email: 'ada@acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
} as WorkspacePersonEnrichment;

describe('matchWorkspacePersonEnrichmentToUserEmail', () => {
  it('should keep an enrichment matching the user email case-insensitively', () => {
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
});
