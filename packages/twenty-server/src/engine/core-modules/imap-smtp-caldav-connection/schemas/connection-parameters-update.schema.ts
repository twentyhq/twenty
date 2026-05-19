import { z } from 'zod';

import { connectionParametersSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters.schema';

export const connectionParametersUpdateSchema =
  connectionParametersSchema.extend({
    password: z.string().min(1, 'Password is required').optional(),
  });
