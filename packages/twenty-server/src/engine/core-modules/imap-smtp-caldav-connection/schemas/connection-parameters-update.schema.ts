import { connectionParametersSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters.schema';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

export const connectionParametersUpdateSchema =
  connectionParametersSchema.extend({
    password: plaintextStringSchema.min(1, 'Password is required').optional(),
  });
