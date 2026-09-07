import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { hasEmailForwardingScopes, isDefined } from 'twenty-shared/utils';
import { In, IsNull, Repository } from 'typeorm';

import { EMAIL_FORWARDING_PROVIDERS } from 'src/engine/core-modules/email-forwarding/drivers/constants/email-forwarding-providers.constant';
import { EmailForwardingDriverFactory } from 'src/engine/core-modules/email-forwarding/drivers/email-forwarding-driver.factory';
import {
  EmailForwardingDriverException,
  EmailForwardingDriverExceptionCode,
} from 'src/engine/core-modules/email-forwarding/drivers/exceptions/email-forwarding-driver.exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

@Injectable()
export class EmailForwardingService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectedAccountRefreshTokensService: ConnectedAccountRefreshTokensService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
    private readonly emailForwardingDriverFactory: EmailForwardingDriverFactory,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async createForwardingAddress({
    workspaceId,
    sourceAddress,
    destinationAddress,
    displayName,
  }: {
    workspaceId: string;
    sourceAddress: string;
    destinationAddress: string;
    displayName: string;
  }): Promise<string | null> {
    const adminAccount = await this.findAdminAccount({
      workspaceId,
      sourceAddress,
    });

    if (!isDefined(adminAccount)) {
      return null;
    }

    const driver = this.emailForwardingDriverFactory.getDriver(
      adminAccount.provider,
    );

    try {
      await driver.createForwardingAddress({
        sourceAddress,
        destinationAddress,
        displayName,
        accessToken: await this.resolveAccessToken(adminAccount),
      });

      return null;
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        additionalData: {
          sourceAddress,
          destinationAddress,
          provider: adminAccount.provider,
        },
        workspace: { id: workspaceId },
      });

      return error.message;
    }
  }

  async deleteForwardingAddress({
    workspaceId,
    sourceAddress,
    destinationAddress,
  }: {
    workspaceId: string;
    sourceAddress: string;
    destinationAddress: string;
  }): Promise<void> {
    const adminAccount = await this.findAdminAccount({
      workspaceId,
      sourceAddress,
    });

    if (!isDefined(adminAccount)) {
      return;
    }

    const driver = this.emailForwardingDriverFactory.getDriver(
      adminAccount.provider,
    );

    try {
      await driver.deleteForwardingAddress({
        sourceAddress,
        destinationAddress,
        accessToken: await this.resolveAccessToken(adminAccount),
      });
    } catch (error) {
      this.exceptionHandlerService.captureExceptions([error], {
        additionalData: {
          sourceAddress,
          destinationAddress,
          provider: adminAccount.provider,
        },
        workspace: { id: workspaceId },
      });
    }
  }

  private async findAdminAccount({
    workspaceId,
    sourceAddress,
  }: {
    workspaceId: string;
    sourceAddress: string;
  }): Promise<ConnectedAccountEntity | undefined> {
    const connectedAccounts = await this.connectedAccountRepository.find({
      where: {
        workspaceId,
        provider: In(EMAIL_FORWARDING_PROVIDERS),
        archivedAt: IsNull(),
        authFailedAt: IsNull(),
      },
      order: { createdAt: 'ASC' },
    });

    const adminAccounts = connectedAccounts.filter((connectedAccount) =>
      hasEmailForwardingScopes(connectedAccount),
    );

    const sourceDomain = getDomainFromEmail(sourceAddress)?.toLowerCase();

    const accountOnSourceDomain = adminAccounts.find(
      (adminAccount) =>
        getDomainFromEmail(adminAccount.handle)?.toLowerCase() === sourceDomain,
    );

    if (isDefined(accountOnSourceDomain)) {
      return accountOnSourceDomain;
    }

    // A single provider still owns addresses on its secondary domains, but with
    // several connected there is no way to tell which tenant the address belongs to.
    return adminAccounts.length === 1 ? adminAccounts[0] : undefined;
  }

  private async resolveAccessToken(
    connectedAccount: ConnectedAccountEntity,
  ): Promise<string> {
    const { accessToken } =
      await this.connectedAccountRefreshTokensService.resolveTokens(
        connectedAccount,
        connectedAccount.workspaceId,
      );

    if (!isDefined(accessToken)) {
      throw new EmailForwardingDriverException(
        `No access token available for connected account ${connectedAccount.id}`,
        EmailForwardingDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    return this.connectedAccountTokenEncryptionService.decrypt({
      ciphertext: accessToken,
      workspaceId: connectedAccount.workspaceId,
    });
  }
}
