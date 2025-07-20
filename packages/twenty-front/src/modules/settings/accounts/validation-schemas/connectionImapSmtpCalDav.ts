import { ACCOUNT_PROTOCOLS } from '@/settings/accounts/constants/AccountProtocols';
import { z } from 'zod';
import { ConnectionParameters } from '~/generated/graphql';

const connectionParameters = z
  .object({
    host: z.string().default(''),
    port: z.number().int().nullable().default(null),
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
      message: 'Port must be a positive number when configuring this protocol',
      path: ['port'],
    },
  );

export const connectionImapSmtpCalDav = z
  .object({
    handle: z.string().email('Invalid email address'),
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
      message:
        'At least one account type (IMAP, SMTP, or CalDAV) must be completely configured',
      path: ['handle'],
    },
  );

export const isProtocolConfigured = (config: ConnectionParameters): boolean => {
  return Boolean(config?.host?.trim() && config?.password?.trim());
};
