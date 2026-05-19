import { z } from 'zod';

import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { connectionParametersUpdateSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters-update.schema';
import { connectionParametersSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters.schema';

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
