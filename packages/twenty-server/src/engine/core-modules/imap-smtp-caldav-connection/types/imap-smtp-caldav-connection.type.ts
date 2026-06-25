import { z } from 'zod';

import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { connectionParametersUpdateSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters-update.schema';
import { connectionParametersSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters.schema';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

// `Pwd` parameterizes the leaf `password` type so the same shape can describe
// the at-rest form (`EncryptedConnectionParameters`) and the in-flight form
// (`PlaintextConnectionParameters`) without losing type safety at the JSONB
// boundary. Defaulting to `string` keeps unbranded consumers — GraphQL DTOs,
// read-only host/port/username consumers — source-compatible. Domain code
// should prefer the named aliases below over re-parameterizing inline.
export type ConnectionParameters<Pwd extends string = string> = Omit<
  z.infer<typeof connectionParametersSchema>,
  'password'
> & { password: Pwd };

export type ConnectionParametersUpdate<Pwd extends string = string> = Omit<
  z.infer<typeof connectionParametersUpdateSchema>,
  'password'
> & { password?: Pwd };

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';

export type ImapSmtpCaldavParams<Pwd extends string = string> = {
  IMAP?: ConnectionParameters<Pwd>;
  SMTP?: ConnectionParameters<Pwd>;
  CALDAV?: ConnectionParameters<Pwd>;
};

export type EncryptedConnectionParameters =
  ConnectionParameters<EncryptedString>;
export type PlaintextConnectionParameters =
  ConnectionParameters<PlaintextString>;

export type EncryptedImapSmtpCaldavParams =
  ImapSmtpCaldavParams<EncryptedString>;
export type PlaintextImapSmtpCaldavParams =
  ImapSmtpCaldavParams<PlaintextString>;
