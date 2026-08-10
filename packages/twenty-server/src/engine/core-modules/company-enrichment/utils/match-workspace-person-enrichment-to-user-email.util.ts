import { isDefined } from 'twenty-shared/utils';
import { type WorkspacePersonEnrichment } from 'twenty-shared/workspace';

// The client round-trips the enrichment through localStorage, which survives
// sign-out: a mismatched email means the profile belongs to another user.
export const matchWorkspacePersonEnrichmentToUserEmail = ({
  personEnrichment,
  userEmail,
}: {
  personEnrichment: WorkspacePersonEnrichment | null;
  userEmail: string;
}): WorkspacePersonEnrichment | null =>
  isDefined(personEnrichment) &&
  personEnrichment.email.toLowerCase() === userEmail.trim().toLowerCase()
    ? personEnrichment
    : null;
