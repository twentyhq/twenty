import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappCounterpart } from 'src/logic-functions/types/whatsapp-counterpart.type';
import { getWhatsappPhoneHandle } from 'src/logic-functions/utils/get-whatsapp-phone-handle.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export const toWhatsappCounterparts = (
  users: UnipileUser[],
): WhatsappCounterpart[] =>
  users.flatMap((user) => {
    const handle = getWhatsappPhoneHandle(user);

    return isDefined(handle) ? [{ user, handle }] : [];
  });
