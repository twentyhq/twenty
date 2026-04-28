import { Resend } from 'resend';
import { isDefined } from '@utils/is-defined';

export const getResendClient = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!isDefined(apiKey)) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  return new Resend(apiKey);
};
