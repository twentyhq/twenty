import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { isNonEmptyString } from '@sniptt/guards';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { ConnectionParametersInput } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.input';
import { connectionParametersUpdateSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters-update.schema';
import { connectionParametersSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters.schema';
import { type ConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

@Injectable()
export class ImapSmtpCaldavValidatorService {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async validateProtocolConnectionParams({
    params,
    existingProtocolParams,
  }: {
    params: ConnectionParametersInput;
    existingProtocolParams: ConnectionParameters | null;
  }): Promise<ConnectionParameters> {
    if (!params) {
      throw new UserInputError('Protocol connection parameters are required', {
        userFriendlyMessage: msg`Please provide connection details to configure your email account.`,
      });
    }

    const schema = existingProtocolParams
      ? connectionParametersUpdateSchema
      : connectionParametersSchema;

    const result = schema.safeParse(params);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      throw new UserInputError(
        `Protocol connection validation failed: ${errorMessages}`,
        {
          userFriendlyMessage: msg`Please check your connection settings. Make sure the server host, port, and password are correct.`,
        },
      );
    }

    const validated = result.data;

    try {
      await this.secureHttpClientService.getValidatedHost(validated.host);
    } catch {
      throw new UserInputError(
        'Connection to private or internal network addresses is not allowed',
        {
          userFriendlyMessage: msg`The server address you entered is not allowed. Please use a public server address.`,
        },
      );
    }

    const password =
      validated.password ?? existingProtocolParams?.password ?? null;

    if (!isNonEmptyString(password)) {
      throw new UserInputError(
        'Password is required — no existing password found',
        {
          userFriendlyMessage: msg`Please provide a password for this connection.`,
        },
      );
    }

    return { ...validated, password };
  }
}
