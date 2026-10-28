import { isDefined } from 'twenty-shared/utils';
import { type WorkspacePersonEnrichment } from 'twenty-shared/workspace';

export const matchWorkspacePersonEnrichmentToUserEmail = <
  TPersonEnrichment extends Pick<WorkspacePersonEnrichment, 'email'>,
>({
  personEnrichment,
  userEmail,
}: {
  personEnrichment: TPersonEnrichment | null;
  userEmail: string;
}): TPersonEnrichment | null =>
  isDefined(personEnrichment) &&
  personEnrichment.email.toLowerCase() === userEmail.trim().toLowerCase()
    ? personEnrichment
    : null;
