import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { toErrorMessage } from 'src/utils/to-error-message';

export const toTeamsGraphUsersErrorMessage = (error: unknown): string =>
  error instanceof GraphRequestError && error.status === 403
    ? 'Microsoft did not allow reading the organization directory. Reconnect Microsoft Teams from the app settings to grant directory access, or ask a tenant administrator to allow it.'
    : toErrorMessage(error);
