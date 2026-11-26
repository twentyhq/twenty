import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type ConnectionCallbackPayload,
  type ConnectionCallbackResult,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_CALLBACK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS } from 'src/unipile/constants/unipile-hosted-auth-link-ttl-milliseconds.constant';
import { getWhatsappAccountPhoneHandle } from 'src/logic-functions/utils/get-whatsapp-account-phone-handle.util';
import { getUnipileAccount } from 'src/unipile/utils/get-unipile-account.util';

export const whatsappCallbackHandler = async ({
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
    throw new Error('WhatsApp linking returned no account');
  }

  const account = await getUnipileAccount(accountId);

  if (account.provider !== 'whatsapp') {
    throw new Error(`Unipile account ${accountId} is not a WhatsApp account`);
  }

  if (
    Date.now() - new Date(account.created_at).getTime() >
    UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS
  ) {
    throw new Error(
      `Unipile account ${accountId} was not created by this QR code`,
    );
  }

  return {
    externalAccountId: account.id,
    handle:
      getWhatsappAccountPhoneHandle(account) ?? account.name ?? account.user_id,
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_CALLBACK_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-callback',
  description:
    'Confirms the WhatsApp account Unipile redirected back with once the QR code was scanned.',
  timeoutSeconds: 10,
  handler: whatsappCallbackHandler,
});
