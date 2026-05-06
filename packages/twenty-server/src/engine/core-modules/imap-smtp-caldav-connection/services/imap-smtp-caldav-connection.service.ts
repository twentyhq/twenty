import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { ImapFlow } from 'imapflow';
import { createTransport } from 'nodemailer';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import {
  type AccountType,
  type ConnectionParameters,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CalDavClientService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-client.service';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';

@Injectable()
export class ImapSmtpCaldavService {
  private readonly logger = new Logger(ImapSmtpCaldavService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly caldavClientService: CalDavClientService,
    private readonly caldavFetchEventsService: CalDavFetchEventsService,
  ) {}

  async testImapConnection(
    handle: string,
    params: ConnectionParameters,
  ): Promise<boolean> {
    const validatedHost = await this.secureHttpClientService.getValidatedHost(
      params.host,
    );
    const client = new ImapFlow({
      host: validatedHost,
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
    const validatedHost = await this.secureHttpClientService.getValidatedHost(
      params.host,
    );
    const transport = createTransport({
      host: validatedHost,
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
    try {
      const client = await this.caldavClientService.getClient({
        serverUrl: params.host,
        username: params.username ?? handle,
        password: params.password,
      });

      const calendars =
        await this.caldavFetchEventsService.listEventCalendars(client);

      if (calendars.length === 0) {
        throw new UserInputError('No calendar with event support found', {
          userFriendlyMessage: msg`We couldn't find any calendars on your CalDAV server. Please make sure your account has at least one calendar.`,
        });
      }
    } catch (error) {
      if (error instanceof UserInputError) {
        throw error;
      }

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
  ): Promise<ConnectedAccountEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const connectedAccount = await this.connectedAccountRepository.findOne({
          where: {
            id: connectionId,
            provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
            workspaceId,
          },
        });

        return connectedAccount;
      },
      authContext,
    );
  }
}
