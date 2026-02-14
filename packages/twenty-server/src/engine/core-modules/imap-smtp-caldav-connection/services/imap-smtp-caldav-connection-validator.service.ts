import { Injectable } from '@nestjs/common';

import * as dns from 'dns/promises';
import { isIP } from 'net';

import { msg } from '@lingui/core/macro';
import { z } from 'zod';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type ConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { isPrivateIp } from 'src/engine/core-modules/secure-http-client/utils/is-private-ip.util';

@Injectable()
export class ImapSmtpCaldavValidatorService {
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

    const validatedParams = this.parseConnectionParams(params);

    await this.assertHostNotPrivate(validatedParams.host);

    return validatedParams;
  }

  private parseConnectionParams(
    params: ConnectionParameters,
  ): ConnectionParameters {
    try {
      return this.protocolConnectionSchema.parse(params);
    } catch (error) {
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

  private async assertHostNotPrivate(host: string): Promise<void> {
    const hostname = this.extractHostname(host);

    const resolvedIps = isIP(hostname)
      ? [hostname]
      : await this.resolveAllAddresses(hostname);

    const privateIp = resolvedIps.find((ip) => isPrivateIp(ip));

    if (privateIp) {
      throw new UserInputError(
        'Connection to private or internal network addresses is not allowed.',
        {
          userFriendlyMessage: msg`The server address you provided points to a private or internal network and cannot be used.`,
        },
      );
    }
  }

  private extractHostname(host: string): string {
    if (isIP(host)) {
      return host;
    }

    const urlString = host.includes('://') ? host : `https://${host}`;

    try {
      return new URL(urlString).hostname;
    } catch {
      return host;
    }
  }

  private async resolveAllAddresses(hostname: string): Promise<string[]> {
    try {
      const results = await dns.lookup(hostname, { all: true });

      return results.map(({ address }) => address);
    } catch {
      throw new UserInputError(`Could not resolve hostname: ${hostname}`, {
        userFriendlyMessage: msg`We couldn't find the server you specified. Please check the hostname and try again.`,
      });
    }
  }
}
