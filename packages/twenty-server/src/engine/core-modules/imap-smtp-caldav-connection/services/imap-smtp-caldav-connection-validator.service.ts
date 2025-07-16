import { Injectable } from '@nestjs/common';

import { z } from 'zod';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';

@Injectable()
export class ImapSmtpCaldavValidatorService {
  private readonly protocolConnectionSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.number().int().positive('Port must be a positive number'),
    username: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
    secure: z.boolean().optional(),
  });

  validateProtocolConnectionParams(
    params: ConnectionParameters,
  ): ConnectionParameters {
    if (!params) {
      throw new UserInputError('Protocol connection parameters are required', {
        userFriendlyMessage:
          'Please provide connection details to configure your email account.',
      });
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
          {
            userFriendlyMessage:
              'Please check your connection settings. Make sure the server host, port, and password are correct.',
          },
        );
      }

      throw new UserInputError('Protocol connection validation failed', {
        userFriendlyMessage:
          'There was an issue with your connection settings. Please try again.',
      });
    }
  }
}
