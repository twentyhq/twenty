import { Injectable } from '@nestjs/common';

import { createTransport, type Transporter } from 'nodemailer';
import { isDefined } from 'twenty-shared/utils';

import type SMTPConnection from 'nodemailer/lib/smtp-connection';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class SmtpClientProvider {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  public async getSmtpClient(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'connectionParameters' | 'handle'
    >,
  ): Promise<Transporter> {
    const smtpParams = connectedAccount.connectionParameters?.SMTP;

    if (!isDefined(smtpParams)) {
      throw new Error('SMTP settings not configured for this account');
    }

    const validatedSmtpHost =
      await this.secureHttpClientService.getValidatedHost(smtpParams.host);

    const options: SMTPConnection.Options = {
      host: validatedSmtpHost,
      port: smtpParams.port,
      auth: {
        user: smtpParams.username ?? connectedAccount.handle ?? '',
        pass: smtpParams.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    const transporter = createTransport(options);

    return transporter;
  }
}
