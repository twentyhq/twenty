import { t } from '@lingui/core/macro';
import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { z } from 'zod';
import { type ConnectionParametersInput } from '~/generated-metadata/graphql';

import {
  isProtocolConfigured,
  isProtocolConfiguredForUpdate,
} from '@/settings/accounts/utils/isProtocolConfigured';

const getConnectionParametersSchema = () =>
  z
    .object({
      host: z.string().default(''),
      port: z.int().nullable().default(null),
      username: z.string().optional(),
      password: z.string().default(''),
      connectionSecurity: z
        .enum(['NONE', 'STARTTLS', 'SSL_TLS'])
        .default('SSL_TLS'),
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
        error: t`Port must be a positive number when configuring this protocol`,
      },
    );

export const getConnectionImapSmtpCalDavSchema = () =>
  z
    .object({
      name: z.string().trim(),
      handle: z.email(t`Invalid email address`),
      IMAP: getConnectionParametersSchema().optional(),
      SMTP: getConnectionParametersSchema().optional(),
      CALDAV: getConnectionParametersSchema().optional(),
    })
    .refine(
      (data) => {
        return ACCOUNT_TYPES.some((protocol) =>
          isProtocolConfigured(data[protocol] as ConnectionParametersInput),
        );
      },
      {
        path: ['handle'],
        error: t`At least one account type (IMAP, SMTP, or CalDAV) must be completely configured`,
      },
    );

export const getConnectionImapSmtpCalDavUpdateSchema = () =>
  z
    .object({
      name: z.string().trim(),
      handle: z.email(t`Invalid email address`),
      IMAP: getConnectionParametersSchema().optional(),
      SMTP: getConnectionParametersSchema().optional(),
      CALDAV: getConnectionParametersSchema().optional(),
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
        error: t`At least one account type (IMAP, SMTP, or CalDAV) must be completely configured`,
      },
    );
