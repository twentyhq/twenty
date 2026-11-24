import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

const getContactName = (specifics: UnipileUser['specifics']): unknown =>
  isObject(specifics) && 'contact_name' in specifics
    ? specifics.contact_name
    : undefined;

// The address-book name comes first: the profile name is whatever the contact typed
export const getWhatsappUserName = (
  user: Pick<UnipileUser, 'display_name' | 'specifics'>,
): string => {
  const contactName = getContactName(user.specifics);

  return isNonEmptyString(contactName) && isNonEmptyString(contactName.trim())
    ? contactName.trim()
    : (user.display_name ?? '').trim();
};
