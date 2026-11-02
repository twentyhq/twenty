import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type ConnectionCallbackPayload,
  type ConnectionCallbackResult,
} from 'twenty-sdk/logic-function';

import { LINKEDIN_CALLBACK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS } from 'src/unipile/constants/unipile-hosted-auth-link-ttl-milliseconds.constant';
import { getUnipileAccount } from 'src/unipile/utils/get-unipile-account.util';

export const linkedinCallbackHandler = async ({
  queryStringParameters,
}: ConnectionCallbackPayload): Promise<ConnectionCallbackResult> => {
  const {
    account_id: accountId,
    error_title: errorTitle,
    error_detail: errorDetail,
  } = queryStringParameters;

  if (isNonEmptyString(errorTitle)) {
    throw new Error(
      isNonEmptyString(errorDetail)
        ? `${errorTitle}: ${errorDetail}`
        : errorTitle,
    );
  }

  if (!isNonEmptyString(accountId)) {
    throw new Error('LinkedIn sign-in returned no account');
  }

  const account = await getUnipileAccount(accountId);

  if (account.provider !== 'linkedin') {
    throw new Error(`Unipile account ${accountId} is not a LinkedIn account`);
  }

  if (
    Date.now() - new Date(account.created_at).getTime() >
    UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS
  ) {
    throw new Error(
      `Unipile account ${accountId} was not created by this sign-in`,
    );
  }

  return {
    externalAccountId: account.id,
    handle: account.name ?? account.user_id,
  };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_CALLBACK_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-callback',
  description:
    'Confirms the LinkedIn account Unipile redirected back with after sign-in.',
  timeoutSeconds: 10,
  handler: linkedinCallbackHandler,
});
