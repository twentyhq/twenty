import { ACCOUNT_PROTOCOLS } from '@/settings/accounts/constants/AccountProtocols';
import { z } from 'zod';
import { ConnectionParameters } from '~/generated/graphql';

const connectionParameters = z.object({
  host: z.string().optional().default(''),
  port: z.number().int().positive('Port must be a positive number').default(0),
  password: z.string().optional().default(''),
  secure: z.boolean().default(true).nullable(),
});

export const connectionImapSmtpCalDav = z
  .object({
    handle: z.string().email('Invalid email address'),
    IMAP: connectionParameters,
    SMTP: connectionParameters,
    CALDAV: connectionParameters,
  })
  .refine(
    (data) => {
      return ACCOUNT_PROTOCOLS.some((protocol) =>
        isProtocolConfigured(data[protocol]),
      );
    },
    {
      message:
        'At least one account type (IMAP, SMTP, or CalDAV) must be completely configured',
      path: ['handle'],
    },
  );

export const isProtocolConfigured = (config: ConnectionParameters): boolean => {
  return Boolean(config.host?.trim() && config.password?.trim());
};
