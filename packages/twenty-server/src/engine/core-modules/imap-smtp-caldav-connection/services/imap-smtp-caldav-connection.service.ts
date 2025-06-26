import { Injectable, Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  AccountType,
  ConnectionParameters,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class ImapSmtpCaldavService {
  private readonly logger = new Logger(ImapSmtpCaldavService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async testImapConnection(params: ConnectionParameters): Promise<boolean> {
    if (!params.host || !params.username || !params.password) {
      throw new UserInputError('Missing required IMAP connection parameters');
    }

    const client = new ImapFlow({
      host: params.host,
      port: params.port,
      secure: params.secure ?? true,
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
        `IMAP connection successful. Found ${mailboxes.length} mailboxes.`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `IMAP connection failed: ${error.message}`,
        error.stack,
      );

      if (error.authenticationFailed) {
        throw new UserInputError(
          'IMAP authentication failed. Please check your credentials.',
        );
      }

      if (error.code === 'ECONNREFUSED') {
        throw new UserInputError(
          `IMAP connection refused. Please verify server and port.`,
        );
      }

      throw new UserInputError(`IMAP connection failed: ${error.message}`);
    } finally {
      if (client.authenticated) {
        await client.logout();
      }
    }
  }

  async testSmtpConnection(params: ConnectionParameters): Promise<boolean> {
    this.logger.log('SMTP connection testing not yet implemented', params);

    return true;
  }

  async testCaldavConnection(params: ConnectionParameters): Promise<boolean> {
    this.logger.log('CALDAV connection testing not yet implemented', params);

    return true;
  }

  async testImapSmtpCaldav(
    params: ConnectionParameters,
    accountType: AccountType,
  ): Promise<boolean> {
    if (accountType === 'IMAP') {
      return this.testImapConnection(params);
    }

    if (accountType === 'SMTP') {
      return this.testSmtpConnection(params);
    }

    if (accountType === 'CALDAV') {
      return this.testCaldavConnection(params);
    }

    throw new UserInputError(
      'Invalid account type. Must be one of: IMAP, SMTP, CALDAV',
    );
  }

  async getImapSmtpCaldav(
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
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      },
    });

    return connectedAccount;
  }
}
