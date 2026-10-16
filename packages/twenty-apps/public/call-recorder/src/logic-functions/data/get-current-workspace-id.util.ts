import { getAppAccessTokenPayload } from 'src/logic-functions/utils/get-app-access-token-payload.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const getCurrentWorkspaceId = (): string | undefined =>
  getString(getAppAccessTokenPayload()?.workspaceId);
