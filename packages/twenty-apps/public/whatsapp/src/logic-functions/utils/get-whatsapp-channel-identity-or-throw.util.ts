import { isDefined } from 'twenty-sdk/utils';

import { getWhatsappAccountPhoneHandle } from 'src/logic-functions/utils/get-whatsapp-account-phone-handle.util';
import { getWhatsappPhoneHandle } from 'src/logic-functions/utils/get-whatsapp-phone-handle.util';
import { getWhatsappUserName } from 'src/logic-functions/utils/get-whatsapp-user-name.util';
import { getUnipileAccount } from 'src/unipile/utils/get-unipile-account.util';
import { getUnipileUser } from 'src/unipile/utils/get-unipile-user.util';

type WhatsappChannelIdentity = { handle: string; displayName?: string };

export const getWhatsappChannelIdentityOrThrow = async (
  unipileAccountId: string,
): Promise<WhatsappChannelIdentity> => {
  const account = await getUnipileAccount(unipileAccountId);
  const accountHandle = getWhatsappAccountPhoneHandle(account);

  if (isDefined(accountHandle)) {
    return {
      handle: accountHandle,
      displayName: /\p{L}/u.test(account.name ?? '') ? account.name : undefined,
    };
  }

  // Unipile does not document where a WhatsApp account carries its own number
  const profile = await getUnipileUser({
    accountId: unipileAccountId,
    userId: 'me',
  });
  const profileHandle = getWhatsappPhoneHandle(profile);

  if (!isDefined(profileHandle)) {
    throw new Error(
      `Unipile account ${unipileAccountId} exposes no WhatsApp phone number`,
    );
  }

  return {
    handle: profileHandle,
    displayName: getWhatsappUserName(profile) || undefined,
  };
};
