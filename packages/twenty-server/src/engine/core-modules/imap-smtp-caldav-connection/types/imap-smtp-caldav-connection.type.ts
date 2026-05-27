import { z } from 'zod';

import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { connectionParametersUpdateSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters-update.schema';
import { connectionParametersSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters.schema';

// `Pwd` parameterizes the leaf `password` type so the same shape can describe
// the at-rest form (`ConnectionParameters<EncryptedString>`) and the in-flight
// form (`ConnectionParameters<PlaintextString>`) without losing type safety
// at the JSONB boundary. Defaulting to `string` keeps existing read-only
// consumers (host/port/username) source-compatible.
export type ConnectionParameters<Pwd extends string = string> = Omit<
  z.infer<typeof connectionParametersSchema>,
  'password'
> & { password: Pwd };

export type ConnectionParametersUpdate<Pwd extends string = string> = Omit<
  z.infer<typeof connectionParametersUpdateSchema>,
  'password'
> & { password?: Pwd };

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export type ImapSmtpCaldavParams<Pwd extends string = string> = {
  IMAP?: ConnectionParameters<Pwd>;
  SMTP?: ConnectionParameters<Pwd>;
  CALDAV?: ConnectionParameters<Pwd>;
};
