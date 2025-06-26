import { Injectable } from '@nestjs/common';

import { z } from 'zod';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';

@Injectable()
export class ImapSmtpCaldavValidatorService {
  private readonly protocolConnectionSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.number().int().positive('Port must be a positive number'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    secure: z.boolean().optional(),
  });

  validateProtocolConnectionParams(
    params: ConnectionParameters,
  ): ConnectionParameters {
    if (!params) {
      throw new UserInputError('Protocol connection parameters are required');
    }

    try {
      return this.protocolConnectionSchema.parse(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');

        throw new UserInputError(
          `Protocol connection validation failed: ${errorMessages}`,
        );
      }

      throw new UserInputError('Protocol connection validation failed');
    }
  }
}
