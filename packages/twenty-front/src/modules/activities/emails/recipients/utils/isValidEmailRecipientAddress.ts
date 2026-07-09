import { emailSchema } from 'twenty-shared/utils';

export const isValidEmailRecipientAddress = (address: string): boolean =>
  emailSchema.safeParse(address).success;
