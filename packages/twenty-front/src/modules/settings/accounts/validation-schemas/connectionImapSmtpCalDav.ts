import { ACCOUNT_PROTOCOLS } from '@/settings/accounts/constants/AccountProtocols';
import { z } from 'zod';
import { type ConnectionParameters } from '~/generated/graphql';

const connectionParameters = z
  .object({
    host: z.string().default(''),
    port: z.int().nullable().default(null),
    username: z.string().optional(),
    password: z.string().default(''),
    secure: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (Boolean(data.host?.trim()) && Boolean(data.password?.trim())) {
        return data.port && data.port > 0;
      }
      return true;
    },
    {
      path: ['port'],
      error: 'Port must be a positive number when configuring this protocol',
    },
  );

export const connectionImapSmtpCalDav = z
  .object({
    handle: z.email('Invalid email address'),
    IMAP: connectionParameters.optional(),
    SMTP: connectionParameters.optional(),
    CALDAV: connectionParameters.optional(),
  })
  .refine(
    (data) => {
      return ACCOUNT_PROTOCOLS.some((protocol) =>
        isProtocolConfigured(data[protocol] as ConnectionParameters),
      );
    },
    {
      path: ['handle'],
      error:
        'At least one account type (IMAP, SMTP, or CalDAV) must be completely configured',
    },
  );

export const isProtocolConfigured = (config: ConnectionParameters): boolean => {
  return Boolean(config?.host?.trim() && config?.password?.trim());
};
