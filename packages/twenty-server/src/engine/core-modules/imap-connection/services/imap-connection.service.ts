import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

type ImapConnectionParams = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
};

@Injectable()
export class ImapConnectionService {
  private readonly logger = new Logger(ImapConnectionService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async testConnection(params: ImapConnectionParams): Promise<boolean> {
    if (!params.host || !params.username || !params.password) {
      throw new UserInputError('Missing required IMAP connection parameters');
    }

    const client = new ImapFlow({
      host: params.host,
      port: params.secure ? 993 : 143,
      secure: params.secure,
      auth: {
        user: params.username,
        pass: params.password,
      },
      logger: false,
      tls: {
        rejectUnauthorized: false,
      },
    });

    try {
      await client.connect();

      const mailboxes = await client.list();

      this.logger.log(
        `Connection successful. Found ${mailboxes.length} mailboxes.`,
      );

      await client.logout();

      return true;
    } catch (error) {
      this.logger.error(
        `IMAP connection failed: ${error.message}`,
        error.stack,
      );

      if (error.authenticationFailed) {
        throw new UserInputError(
          'Authentication failed. Please check your credentials.',
        );
      }

      if (error.code === 'ECONNREFUSED') {
        throw new UserInputError(
          `Connection refused. Please verify server and port.`,
        );
      }

      throw new UserInputError(`IMAP connection failed: ${error.message}`);
    } finally {
      if (client.authenticated) {
        await client.logout();
      }
    }
  }

  formatConnectionParams(params: {
    host: string;
    port: number;
    secure: boolean;
    password: string;
  }): Record<string, unknown> {
    return {
      imapServer: params.host,
      imapPort: params.port,
      imapEncryption: params.secure ? 'SSL' : 'None',
      imapPassword: params.password,
    };
  }

  async getImapConnection(
    workspaceId: string,
    connectionId: string,
  ): Promise<ConnectedAccountWorkspaceEntity | null> {
    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    const connectedAccount = await connectedAccountRepository.findOne({
      where: {
        id: connectionId,
        provider: ConnectedAccountProvider.IMAP,
      },
    });

    return connectedAccount;
  }
}
