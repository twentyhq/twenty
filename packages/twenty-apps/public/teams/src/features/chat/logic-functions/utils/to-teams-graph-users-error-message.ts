import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { toErrorMessage } from 'src/utils/to-error-message';

// A 403 on /users means the delegated token lacks User.ReadBasic.All or the
// tenant restricts member directory reads; both clear after a reconnect.
export const toTeamsGraphUsersErrorMessage = (error: unknown): string =>
  error instanceof GraphRequestError && error.status === 403
    ? 'Microsoft did not allow reading the organization directory. Reconnect Microsoft Teams from the app settings to grant directory access, or ask a tenant administrator to allow it.'
    : toErrorMessage(error);
