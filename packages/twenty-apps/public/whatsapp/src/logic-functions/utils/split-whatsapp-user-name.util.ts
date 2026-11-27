import { getWhatsappUserName } from 'src/logic-functions/utils/get-whatsapp-user-name.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

// WhatsApp shows the phone number of people without a name, which is not a name to save
export const splitWhatsappUserName = (
  user: Pick<UnipileUser, 'display_name' | 'specifics'>,
): { firstName: string; lastName: string } | undefined => {
  const name = getWhatsappUserName(user);

  if (!/\p{L}/u.test(name)) {
    return undefined;
  }

  const [firstName = '', ...lastNameParts] = name.split(/\s+/);

  return { firstName, lastName: lastNameParts.join(' ') };
};
