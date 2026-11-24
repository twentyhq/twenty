import { type UnipileAccount } from 'src/unipile/types/unipile-account.type';
import { getWhatsappPhoneHandle } from 'src/logic-functions/utils/get-whatsapp-phone-handle.util';

export const getWhatsappAccountPhoneHandle = (
  account: Pick<UnipileAccount, 'user_id' | 'name'>,
): string | undefined =>
  getWhatsappPhoneHandle({
    id: account.user_id,
    public_identifier: account.name,
  });
