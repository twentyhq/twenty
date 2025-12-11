import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { ImapFlow } from 'imapflow';
import { createTransport } from 'nodemailer';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type AccountType,
  type ConnectionParameters,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalDAVClient } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/lib/caldav.client';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class ImapSmtpCaldavService {
  private readonly logger = new Logger(ImapSmtpCaldavService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async testImapConnection(
    handle: string,
    params: ConnectionParameters,
  ): Promise<boolean> {
    const client = new ImapFlow({
      host: params.host,
      port: params.port,
      secure: params.secure ?? true,
      auth: {
        user: params.username ?? handle,
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
          {
            userFriendlyMessage: msg`We couldn't log in to your email account. Please check your email address and password, then try again.`,
          },
        );
      }

      if (error.code === 'ECONNREFUSED') {
        throw new UserInputError(
          `IMAP connection refused. Please verify server and port.`,
          {
            userFriendlyMessage: msg`We couldn't connect to your email server. Please check your server settings and try again.`,
          },
        );
      }

      throw new UserInputError(`IMAP connection failed: ${error.message}`, {
        userFriendlyMessage: msg`We encountered an issue connecting to your email account. Please check your settings and try again.`,
      });
    } finally {
      if (client.authenticated) {
        await client.logout();
      }
    }
  }

  async testSmtpConnection(
    handle: string,
    params: ConnectionParameters,
  ): Promise<boolean> {
    const transport = createTransport({
      host: params.host,
      port: params.port,
      auth: {
        user: params.username ?? handle,
        pass: params.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    try {
      await transport.verify();
    } catch (error) {
      this.logger.error(
        `SMTP connection failed: ${error.message}`,
        error.stack,
      );
      throw new UserInputError(`SMTP connection failed: ${error.message}`, {
        userFriendlyMessage: msg`We couldn't connect to your outgoing email server. Please check your SMTP settings and try again.`,
      });
    }

    return true;
  }

  async testCaldavConnection(
    handle: string,
    params: ConnectionParameters,
  ): Promise<boolean> {
    const client = new CalDAVClient({
      serverUrl: params.host,
      username: params.username ?? handle,
      password: params.password,
    });

    try {
      await client.listCalendars();
    } catch (error) {
      this.logger.error(
        `CALDAV connection failed: ${error.message}`,
        error.stack,
      );
      if (error.code === 'FailedToOpenSocket') {
        throw new UserInputError(`CALDAV connection failed: ${error.message}`, {
          userFriendlyMessage: msg`We couldn't connect to your CalDAV server. Please check your server settings and try again.`,
        });
      }

      throw new UserInputError(`CALDAV connection failed: ${error.message}`, {
        userFriendlyMessage: msg`Invalid CALDAV credentials. Please check your username and password.`,
      });
    }

    return true;
  }

  async testImapSmtpCaldav(
    handle: string,
    params: ConnectionParameters,
    accountType: AccountType,
  ): Promise<boolean> {
    if (accountType === 'IMAP') {
      return this.testImapConnection(handle, params);
    }

    if (accountType === 'SMTP') {
      return this.testSmtpConnection(handle, params);
    }

    if (accountType === 'CALDAV') {
      return this.testCaldavConnection(handle, params);
    }

    throw new UserInputError(
      'Invalid account type. Must be one of: IMAP, SMTP, CALDAV',
      {
        userFriendlyMessage: msg`Please select a valid connection type (IMAP, SMTP, or CalDAV) and try again.`,
      },
    );
  }

  async getImapSmtpCaldav(
    workspaceId: string,
    connectionId: string,
  ): Promise<ConnectedAccountWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
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
      },
    );
  }
}
