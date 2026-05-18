import { z } from 'zod';

import { ACCOUNT_TYPES } from 'src/engine/core-modules/imap-smtp-caldav-connection/constants/account-types.constant';

export const connectionParametersSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.int().positive('Port must be a positive number'),
  username: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  secure: z.boolean().optional(),
});

export const connectionParametersUpdateSchema =
  connectionParametersSchema.extend({
    password: z.string().min(1, 'Password is required').optional(),
  });

export type ConnectionParameters = z.infer<typeof connectionParametersSchema>;

export type ConnectionParametersUpdate = z.infer<
  typeof connectionParametersUpdateSchema
>;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export type ImapSmtpCaldavParams = {
  IMAP?: ConnectionParameters;
  SMTP?: ConnectionParameters;
  CALDAV?: ConnectionParameters;
};
