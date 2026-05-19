import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { z } from 'zod';
import { type ConnectionParametersInput } from '~/generated-metadata/graphql';

import {
  isProtocolConfigured,
  isProtocolConfiguredForUpdate,
} from '@/settings/accounts/utils/isProtocolConfigured';

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
      if (Boolean(data.host?.trim())) {
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
      return ACCOUNT_TYPES.some((protocol) =>
        isProtocolConfigured(data[protocol] as ConnectionParametersInput),
      );
    },
    {
      path: ['handle'],
      error:
        'At least one account type (IMAP, SMTP, or CalDAV) must be completely configured',
    },
  );

export const connectionImapSmtpCalDavUpdate = z
  .object({
    handle: z.email('Invalid email address'),
    IMAP: connectionParameters.optional(),
    SMTP: connectionParameters.optional(),
    CALDAV: connectionParameters.optional(),
  })
  .refine(
    (data) => {
      return ACCOUNT_TYPES.some((protocol) =>
        isProtocolConfiguredForUpdate(
          data[protocol] as ConnectionParametersInput,
        ),
      );
    },
    {
      path: ['handle'],
      error:
        'At least one account type (IMAP, SMTP, or CalDAV) must be completely configured',
    },
  );
