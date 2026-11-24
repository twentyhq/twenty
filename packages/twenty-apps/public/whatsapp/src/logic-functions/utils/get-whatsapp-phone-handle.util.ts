import { isNonEmptyString } from '@sniptt/guards';

import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

const WHATSAPP_PHONE_JID_PATTERN = /^(\d+)(?::\d+)?@s\.whatsapp\.net$/;

const PHONE_NUMBER_PATTERN = /^[\d\s().+-]+$/;

const PHONE_NUMBER_MIN_DIGITS = 7;

const PHONE_NUMBER_MAX_DIGITS = 15;

const getPhoneDigits = (value: string | undefined): string | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const trimmedValue = value.trim();
  const digits =
    WHATSAPP_PHONE_JID_PATTERN.exec(trimmedValue)?.[1] ??
    (PHONE_NUMBER_PATTERN.test(trimmedValue)
      ? trimmedValue.replace(/\D/g, '')
      : '');

  return digits.length >= PHONE_NUMBER_MIN_DIGITS &&
    digits.length <= PHONE_NUMBER_MAX_DIGITS
    ? digits
    : undefined;
};

// WhatsApp ids ending in @lid hide the phone number, so those users get no handle
export const getWhatsappPhoneHandle = (
  user: Pick<UnipileUser, 'id' | 'public_identifier'>,
): string | undefined => {
  const digits =
    getPhoneDigits(user.public_identifier) ?? getPhoneDigits(user.id);

  return isNonEmptyString(digits) ? `+${digits}` : undefined;
};
