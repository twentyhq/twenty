import { isNonEmptyString, isString } from '@sniptt/guards';
import { type IdentifyAccountResult } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { EXTERNAL_ACCOUNT_ID_MAX_LENGTH } from 'src/engine/core-modules/application/connection-provider/constants/external-account-id-max-length.constant';

type ParseIdentifyAccountResultOutcome =
  | { isValid: true; identifiedAccount: IdentifyAccountResult | null }
  | { isValid: false; reason: string };

export const parseIdentifyAccountResult = (
  data: unknown,
): ParseIdentifyAccountResultOutcome => {
  if (!isDefined(data)) {
    return { isValid: true, identifiedAccount: null };
  }

  if (!isPlainObject(data)) {
    return {
      isValid: false,
      reason: 'expected an object with an externalAccountId, or null',
    };
  }

  const { externalAccountId, handle } = data;

  if (!isString(externalAccountId)) {
    return { isValid: false, reason: 'externalAccountId must be a string' };
  }

  const trimmedExternalAccountId = externalAccountId.trim();

  if (!isNonEmptyString(trimmedExternalAccountId)) {
    return { isValid: false, reason: 'externalAccountId must not be empty' };
  }

  if (trimmedExternalAccountId.length > EXTERNAL_ACCOUNT_ID_MAX_LENGTH) {
    return {
      isValid: false,
      reason: `externalAccountId must be at most ${EXTERNAL_ACCOUNT_ID_MAX_LENGTH} characters`,
    };
  }

  if (!isDefined(handle)) {
    return {
      isValid: true,
      identifiedAccount: { externalAccountId: trimmedExternalAccountId },
    };
  }

  if (!isString(handle) || !isNonEmptyString(handle.trim())) {
    return {
      isValid: false,
      reason: 'handle, when returned, must be a non-empty string',
    };
  }

  return {
    isValid: true,
    identifiedAccount: {
      externalAccountId: trimmedExternalAccountId,
      handle: handle.trim(),
    },
  };
};
