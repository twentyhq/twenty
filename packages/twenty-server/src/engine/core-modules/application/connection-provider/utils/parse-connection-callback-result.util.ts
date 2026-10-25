import { type ConnectedAccountFromCallback } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  type PlaintextString,
  plaintextStringSchema,
} from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { formatLogicFunctionResultIssues } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/format-logic-function-result-issues.util';
import { EXTERNAL_ACCOUNT_ID_MAX_LENGTH } from 'src/engine/metadata-modules/connected-account/constants/external-account-id-max-length.constant';

export type ParsedConnectedAccountFromCallback = Omit<
  ConnectedAccountFromCallback,
  'accessToken'
> & { accessToken?: PlaintextString };

const connectedAccountFromCallbackSchema = z.object({
  externalAccountId: z
    .string()
    .trim()
    .min(1)
    .max(EXTERNAL_ACCOUNT_ID_MAX_LENGTH),
  handle: z.string().trim().min(1).nullish(),
  accessToken: z.string().min(1).pipe(plaintextStringSchema).nullish(),
});

type ParseConnectionCallbackResultOutcome =
  | {
      isValid: true;
      connectedAccount: ParsedConnectedAccountFromCallback | null;
    }
  | { isValid: false; reason: string };

export const parseConnectionCallbackResult = (
  data: unknown,
): ParseConnectionCallbackResultOutcome => {
  if (!isDefined(data)) {
    return { isValid: true, connectedAccount: null };
  }

  const parsed = connectedAccountFromCallbackSchema.safeParse(data);

  if (!parsed.success) {
    return {
      isValid: false,
      reason: formatLogicFunctionResultIssues(parsed.error),
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
