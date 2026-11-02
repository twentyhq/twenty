import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { getLinkedinPublicIdentifierKey } from 'src/logic-functions/utils/get-linkedin-public-identifier-key.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';
import { getUnipileUser } from 'src/unipile/utils/get-unipile-user.util';
import { UnipileRequestError } from 'src/unipile/utils/request-unipile.util';

const isPermanentUnipileError = (error: unknown): boolean =>
  error instanceof UnipileRequestError &&
  isDefined(error.status) &&
  error.status >= 400 &&
  error.status < 500 &&
  error.status !== 429;

export const withLinkedinPublicIdentifier = async ({
  unipileAccountId,
  user,
}: {
  unipileAccountId: string;
  user: UnipileUser;
}): Promise<UnipileUser> => {
  if (isNonEmptyString(user.public_identifier)) {
    return user;
  }

  const cacheKey = getLinkedinPublicIdentifierKey(user.id);
  const cachedPublicIdentifier = await kv.get<string>(cacheKey);

  if (isNonEmptyString(cachedPublicIdentifier)) {
    return { ...user, public_identifier: cachedPublicIdentifier };
  }

  try {
    const { public_identifier: publicIdentifier } = await getUnipileUser({
      accountId: unipileAccountId,
      userId: user.id,
    });

    if (!isNonEmptyString(publicIdentifier)) {
      return user;
    }

    await kv.set(cacheKey, publicIdentifier);

    return { ...user, public_identifier: publicIdentifier };
  } catch (error) {
    if (!isPermanentUnipileError(error)) {
      throw error;
    }

    console.warn(
      `[linkedin] could not resolve the public identifier of ${user.id}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return user;
  }
};
