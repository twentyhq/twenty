import { Injectable } from '@nestjs/common';

import { z } from 'zod';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ImapConnectionParams } from 'src/engine/core-modules/imap-connection/types/imap-connection.type';

@Injectable()
export class ImapConnectionValidatorService {
  private readonly imapConnectionSchema = z.object({
    handle: z.string().min(1, 'Handle is required'),
    host: z.string().min(1, 'IMAP server is required'),
    port: z.number().int().positive('Port must be a positive number'),
    secure: z.boolean(),
    password: z.string().min(1, 'Password is required'),
  });

  validateImapConnectionParams(
    customParams: ImapConnectionParams,
  ): z.infer<typeof this.imapConnectionSchema> {
    if (!customParams) {
      throw new UserInputError('IMAP connection parameters are required');
    }

    try {
      return this.imapConnectionSchema.parse(customParams);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');

        throw new UserInputError(
          `IMAP connection validation failed: ${errorMessages}`,
        );
      }

      throw new UserInputError('IMAP connection validation failed');
    }
  }
}
