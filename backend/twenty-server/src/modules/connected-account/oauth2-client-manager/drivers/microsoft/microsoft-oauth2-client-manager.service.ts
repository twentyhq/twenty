import { Injectable } from '@nestjs/common';

import { Client } from '@microsoft/microsoft-graph-client';

import { MicrosoftOAuth2ClientAuthProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-auth-provider';

@Injectable()
export class MicrosoftOAuth2ClientManagerService {
  public async getOAuth2Client(accessToken: string): Promise<Client> {
    const authProvider = new MicrosoftOAuth2ClientAuthProvider(accessToken);

    const client = Client.initWithMiddleware({
      defaultVersion: 'v1.0',
      debugLogging: false,
      authProvider,
    });

    return client;
  }
}
