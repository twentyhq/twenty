import { type ConnectedAccountFromCallback } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { EXTERNAL_ACCOUNT_ID_MAX_LENGTH } from 'src/engine/metadata-modules/connected-account/constants/external-account-id-max-length.constant';

const connectedAccountFromCallbackSchema = z.object({
  externalAccountId: z
    .string()
    .trim()
    .min(1)
    .max(EXTERNAL_ACCOUNT_ID_MAX_LENGTH),
  handle: z.string().trim().min(1).nullish(),
  accessToken: z.string().min(1).nullish(),
});

type ParseConnectionCallbackResultOutcome =
  | { isValid: true; connectedAccount: ConnectedAccountFromCallback | null }
  | { isValid: false; reason: string };

export const parseConnectionCallbackResult = (
  data: unknown,
): ParseConnectionCallbackResultOutcome => {
  if (data === null) {
    return { isValid: true, connectedAccount: null };
  }

  const parsed = connectedAccountFromCallbackSchema.safeParse(data);

  if (!parsed.success) {
    return {
      isValid: false,
      reason: parsed.error.issues
        .map((issue) => `${issue.path.join('.') || 'result'}: ${issue.message}`)
        .join('; '),
    };
  }

  const { externalAccountId, handle, accessToken } = parsed.data;

  return {
    isValid: true,
    connectedAccount: {
      externalAccountId,
      ...(isDefined(handle) ? { handle } : {}),
      ...(isDefined(accessToken) ? { accessToken } : {}),
    },
  };
};
