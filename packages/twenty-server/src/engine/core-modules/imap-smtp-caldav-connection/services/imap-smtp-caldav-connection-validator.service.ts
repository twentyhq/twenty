import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { z } from 'zod';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { HostnameGuardService } from 'src/engine/core-modules/hostname-guard/hostname-guard.service';
import { type ConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';

@Injectable()
export class ImapSmtpCaldavValidatorService {
  constructor(private readonly hostnameGuardService: HostnameGuardService) {}

  private readonly protocolConnectionSchema = z.object({
    host: z.string().min(1, 'Host is required'),
    port: z.int().positive('Port must be a positive number'),
    username: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
    secure: z.boolean().optional(),
  });

  async validateProtocolConnectionParams(
    params: ConnectionParameters,
  ): Promise<ConnectionParameters> {
    if (!params) {
      throw new UserInputError('Protocol connection parameters are required', {
        userFriendlyMessage: msg`Please provide connection details to configure your email account.`,
      });
    }

    try {
      const validated = this.protocolConnectionSchema.parse(params);

      try {
        await this.hostnameGuardService.getValidatedHost(validated.host);
      } catch {
        throw new UserInputError(
          'Connection to private or internal network addresses is not allowed',
          {
            userFriendlyMessage: msg`The server address you entered is not allowed. Please use a public server address.`,
          },
        );
      }

      return validated;
    } catch (error) {
      if (error instanceof UserInputError) {
        throw error;
      }

      if (error instanceof z.ZodError) {
        const errorMessages = error.issues
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');

        throw new UserInputError(
          `Protocol connection validation failed: ${errorMessages}`,
          {
            userFriendlyMessage: msg`Please check your connection settings. Make sure the server host, port, and password are correct.`,
          },
        );
      }

      throw new UserInputError('Protocol connection validation failed', {
        userFriendlyMessage: msg`There was an issue with your connection settings. Please try again.`,
      });
    }
  }
}
