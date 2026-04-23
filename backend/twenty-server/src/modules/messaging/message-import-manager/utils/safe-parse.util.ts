import { Logger } from '@nestjs/common';

import addressparser from 'addressparser';

import { type EmailAddress } from 'src/modules/messaging/message-import-manager/types/email-address';

export const safeParseEmailAddressAddress = (
  address: string,
): string | undefined => {
  const logger = new Logger(safeParseEmailAddressAddress.name);

  try {
    return addressparser(address)[0].address;
  } catch (error) {
    logger.error(`Error parsing address: ${address}`, error);

    return undefined;
  }
};

export const safeParseEmailAddress = (
  emailAddress: EmailAddress,
): EmailAddress => {
  return {
    address: safeParseEmailAddressAddress(emailAddress.address) || '',
    name: emailAddress.name,
  };
};
