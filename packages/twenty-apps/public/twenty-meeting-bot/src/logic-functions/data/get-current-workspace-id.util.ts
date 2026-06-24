import { isUndefined } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

const APP_ACCESS_TOKEN_ENV_VAR_NAME = 'TWENTY_APP_ACCESS_TOKEN';

export const getCurrentWorkspaceId = (): string | undefined => {
  const accessToken = getString(process.env[APP_ACCESS_TOKEN_ENV_VAR_NAME]);

  if (isUndefined(accessToken)) {
    return undefined;
  }

  return getWorkspaceIdFromAccessToken(accessToken);
};

const getWorkspaceIdFromAccessToken = (
  accessToken: string,
): string | undefined => {
  const encodedPayload = accessToken.split('.')[1];

  if (isUndefined(encodedPayload)) {
    return undefined;
  }

  try {
    const payload = asRecord(
      JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')),
    );

    return getString(payload?.workspaceId);
  } catch {
    return undefined;
  }
};
