import { isDefined } from 'twenty-shared/utils';
import { Resend } from 'resend';

export const getResendClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!isDefined(apiKey)) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  return new Resend(apiKey);
};
