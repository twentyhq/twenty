import { Resend } from 'resend';
import { isDefined } from 'twenty-shared/utils';

export const getResendClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!isDefined(apiKey)) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  return new Resend(apiKey);
};
