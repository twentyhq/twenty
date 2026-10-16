import { isNonEmptyString } from '@sniptt/guards';

import { asRecord } from 'src/logic-functions/utils/as-record.util';

export const getAppAccessTokenPayload = ():
  | Record<string, unknown>
  | undefined => {
  const encodedPayload = process.env.TWENTY_APP_ACCESS_TOKEN?.split('.')[1];

  if (!isNonEmptyString(encodedPayload)) {
    return undefined;
  }

  try {
    return asRecord(
      JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')),
    );
  } catch {
    return undefined;
  }
};
