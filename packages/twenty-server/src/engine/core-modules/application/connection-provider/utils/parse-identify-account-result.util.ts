import { type IdentifiedAccount } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { formatLogicFunctionResultIssues } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/format-logic-function-result-issues.util';
import { EXTERNAL_ACCOUNT_ID_MAX_LENGTH } from 'src/engine/metadata-modules/connected-account/constants/external-account-id-max-length.constant';

const identifyAccountResultSchema = z.object({
  externalAccountId: z
    .string()
    .trim()
    .min(1)
    .max(EXTERNAL_ACCOUNT_ID_MAX_LENGTH)
    .nullable(),
  handle: z.string().trim().min(1).nullish(),
});

type ParseIdentifyAccountResultOutcome =
  | { isValid: true; identifiedAccount: IdentifiedAccount | null }
  | { isValid: false; reason: string };

export const parseIdentifyAccountResult = (
  data: unknown,
): ParseIdentifyAccountResultOutcome => {
  const parsed = identifyAccountResultSchema.safeParse(data);

  if (!parsed.success) {
    return {
      isValid: false,
      reason: formatLogicFunctionResultIssues(parsed.error),
    };
  }

  const { externalAccountId, handle } = parsed.data;

  if (!isDefined(externalAccountId)) {
    return { isValid: true, identifiedAccount: null };
  }

  return {
    isValid: true,
    identifiedAccount: isDefined(handle)
      ? { externalAccountId, handle }
      : { externalAccountId },
  };
};
