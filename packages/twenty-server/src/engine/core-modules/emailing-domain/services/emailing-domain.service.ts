import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { msg } from '@lingui/core/macro';

import isEqual from 'lodash.isequal';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { In, Repository } from 'typeorm';

import { lookupDnsRecordsState } from 'src/engine/core-modules/dns-manager/utils/lookup-dns-records-state.util';
import { qualifyDnsRecordName } from 'src/engine/core-modules/dns-manager/utils/qualify-dns-record-name.util';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { type EmailingDomainVerificationResult } from 'src/engine/core-modules/emailing-domain/drivers/interfaces/emailing-domain-driver.interface';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type EmailingDomainVerificationCheck } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-verification-check.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { DmarcRecordService } from 'src/engine/core-modules/emailing-domain/services/dmarc-record.service';
import { UnsubscribeHostnameService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-hostname.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CampaignDeliveryWorkspaceEntity } from 'src/modules/emailing/standard-objects/campaign-delivery.workspace-entity';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

@Injectable()
export class EmailingDomainService {
  private readonly logger = new Logger(EmailingDomainService.name);

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    // Domain is globally unique, so existence checks need an unscoped repository.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(EmailingDomainEntity)
    private readonly globalEmailingDomainRepository: Repository<EmailingDomainEntity>,
    private readonly emailingDomainDriverFactory: EmailingDomainDriverFactory,
    private readonly unsubscribeHostnameService: UnsubscribeHostnameService,
    private readonly dmarcRecordService: DmarcRecordService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  private async withDnsRecords(
    emailingDomain: EmailingDomainEntity,
  ): Promise<EmailingDomainEntity> {
    return this.dmarcRecordService.withDnsRecord(
      await this.unsubscribeHostnameService.withDnsRecords(emailingDomain),
    );
  }

  async createEmailingDomain(
    domain: string,
    workspaceId: string,
  ): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.insertEmailingDomain({
      domain,
      workspaceId,
    });

    await this.setUpEmailingDomain(emailingDomain).catch(async (error) => {
      await this.findEmailingDomainByIdOrThrow(workspaceId, emailingDomain.id)
        .then((currentEmailingDomain) =>
          this.removeEmailingDomain(currentEmailingDomain),
        )
        .catch((removalError) =>
          this.logger.error(
            `Could not roll back emailing domain ${domain} of workspace ${workspaceId}: ${removalError}`,
          ),
        );

      throw error;
    });

    return this.withDnsRecords(
      await this.findEmailingDomainByIdOrThrow(workspaceId, emailingDomain.id),
    );
  }

  private async insertEmailingDomain({
    domain,
    workspaceId,
  }: {
    domain: string;
    workspaceId: string;
  }): Promise<EmailingDomainEntity> {
    const existingEmailingDomain =
      await this.globalEmailingDomainRepository.findOne({
        where: { domain },
      });

    if (isDefined(existingEmailingDomain)) {
      throw new EmailingDomainException(
        'Emailing domain is already registered',
        EmailingDomainExceptionCode.EMAILING_DOMAIN_ALREADY_REGISTERED,
        existingEmailingDomain.workspaceId === workspaceId
          ? {
              userFriendlyMessage: msg`Already registered in this workspace.`,
            }
          : {},
      );
    }

    return this.emailingDomainRepository.insertAndReturnOne(workspaceId, {
      domain,
      status: EmailingDomainStatus.PENDING,
    });
  }

  private async setUpEmailingDomain(
    emailingDomain: EmailingDomainEntity,
  ): Promise<void> {
    await this.emailingDomainDriverFactory
      .getCurrentDriver()
      .provisionWorkspace(emailingDomain.workspaceId);

    await this.refreshEmailingDomain({
      workspaceId: emailingDomain.workspaceId,
      emailingDomainId: emailingDomain.id,
      isUserTriggered: true,
    });
  }

  async ensureEmailingDomain(
    domain: string,
    workspaceId: string,
  ): Promise<void> {
    const existingEmailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { domain } },
    );

    if (isDefined(existingEmailingDomain)) {
      return;
    }

    const emailingDomain = await this.insertEmailingDomain({
      domain,
      workspaceId,
    });

    await this.setUpEmailingDomain(emailingDomain).catch((error) =>
      this.logger.error(
        `Could not set up emailing domain ${domain} of workspace ${workspaceId}, the verification cron retries it: ${error}`,
      ),
    );
  }

  async deleteEmailingDomainByDomainIfExists(
    workspaceId: string,
    domain: string,
  ): Promise<void> {
    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { domain } },
    );

    if (!isDefined(emailingDomain)) {
      return;
    }

    await this.removeEmailingDomain(emailingDomain);
  }

  async deleteEmailingDomain(
    workspace: WorkspaceEntity,
    emailingDomainId: string,
  ): Promise<void> {
    const emailingDomain = await this.findEmailingDomainByIdOrThrow(
      workspace.id,
      emailingDomainId,
    );

    await this.validateNoCampaignSendingOrThrow(workspace.id);

    await this.removeEmailingDomain(emailingDomain);
  }

  private async removeEmailingDomain(
    emailingDomain: EmailingDomainEntity,
  ): Promise<void> {
    await this.unsubscribeHostnameService.deprovision(emailingDomain);
    await this.deleteRemoteEmailingDomain(emailingDomain);
    await this.emailingDomainRepository.delete(emailingDomain.workspaceId, {
      id: emailingDomain.id,
    });
  }

  async validateNoCampaignSendingOrThrow(workspaceId: string): Promise<void> {
    const isCampaignSending =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const hasSendingCampaign = await this.workspaceOrmManager
          .getRepositoryWithoutPermissionChecks(MessageCampaignWorkspaceEntity)
          .exists({ where: { status: MessageCampaignStatus.SENDING } });

        if (hasSendingCampaign) {
          return true;
        }

        return this.workspaceOrmManager
          .getRepositoryWithoutPermissionChecks(CampaignDeliveryWorkspaceEntity)
          .exists({
            where: {
              state: In([
                CAMPAIGN_DELIVERY_STATE.QUEUED,
                CAMPAIGN_DELIVERY_STATE.SENDING,
              ]),
            },
          });
      }, buildSystemAuthContext(workspaceId));

    if (isCampaignSending) {
      throw new EmailingDomainException(
        `Workspace ${workspaceId} has a campaign sending`,
        EmailingDomainExceptionCode.EMAILING_DOMAIN_CAMPAIGN_SENDING,
      );
    }
  }

  async cleanupEmailingDomainsForWorkspace(
    workspaceId: string,
    domains: string[],
  ): Promise<void> {
    const emailingDomainDriver =
      this.emailingDomainDriverFactory.getCurrentDriver();

    if (domains.length === 0) {
      return;
    }

    const results = await Promise.allSettled(
      domains.map((domain) =>
        emailingDomainDriver.cleanupDomain({ domain, workspaceId }),
      ),
    );

    await emailingDomainDriver.deprovisionWorkspace(workspaceId);

    if (results.some((result) => result.status === 'rejected')) {
      throw new Error(
        `Failed to clean up one or more emailing domains for workspace ${workspaceId}`,
      );
    }
  }

  async getEmailingDomains(
    workspace: WorkspaceEntity,
  ): Promise<EmailingDomainEntity[]> {
    const emailingDomains = await this.emailingDomainRepository.find(
      workspace.id,
      {
        order: { createdAt: 'DESC' },
      },
    );

    return Promise.all(
      emailingDomains.map((emailingDomain) =>
        this.withDnsRecords(emailingDomain),
      ),
    );
  }

  async verifyEmailingDomain({
    workspaceId,
    emailingDomainId,
  }: {
    workspaceId: string;
    emailingDomainId: string;
  }): Promise<EmailingDomainEntity> {
    await this.refreshEmailingDomain({
      workspaceId,
      emailingDomainId,
      isUserTriggered: true,
    });

    return this.withDnsRecords(
      await this.emailingDomainRepository.findOneOrFail(workspaceId, {
        where: { id: emailingDomainId },
      }),
    );
  }

  async refreshEmailingDomain({
    workspaceId,
    emailingDomainId,
    isUserTriggered,
  }: {
    workspaceId: string;
    emailingDomainId: string;
    isUserTriggered: boolean;
  }): Promise<void> {
    const emailingDomain = await this.findEmailingDomainByIdOrThrow(
      workspaceId,
      emailingDomainId,
    );

    try {
      await this.refreshAuthentication(emailingDomain, { isUserTriggered });
    } finally {
      await this.unsubscribeHostnameService.sync(
        workspaceId,
        emailingDomain.id,
        { isUserTriggered },
      );
    }
  }

  private async refreshAuthentication(
    emailingDomain: EmailingDomainEntity,
    { isUserTriggered }: { isUserTriggered: boolean },
  ): Promise<void> {
    const verificationResult = await this.verifyAndRestartGivenUpChecks(
      emailingDomain,
      { isUserTriggered },
    );

    if (
      emailingDomain.status === verificationResult.status &&
      isEqual(
        emailingDomain.verificationRecords,
        verificationResult.verificationRecords,
      )
    ) {
      return;
    }

    const hasJustBecomeVerified =
      emailingDomain.status !== EmailingDomainStatus.VERIFIED &&
      verificationResult.status === EmailingDomainStatus.VERIFIED;

    await this.emailingDomainRepository.update(
      emailingDomain.workspaceId,
      { id: emailingDomain.id },
      {
        status: verificationResult.status,
        verificationRecords: verificationResult.verificationRecords,
        ...(hasJustBecomeVerified ? { verifiedAt: new Date() } : {}),
      },
    );
  }

  private async verifyAndRestartGivenUpChecks(
    emailingDomain: Pick<EmailingDomainEntity, 'domain' | 'workspaceId'>,
    { isUserTriggered }: { isUserTriggered: boolean },
  ): Promise<EmailingDomainVerificationResult> {
    const emailingDomainDriver =
      this.emailingDomainDriverFactory.getCurrentDriver();

    const resourceInput = {
      domain: emailingDomain.domain,
      workspaceId: emailingDomain.workspaceId,
    };

    const verificationResult =
      await emailingDomainDriver.verifyDomain(resourceInput);

    const checksToRestart = isUserTriggered
      ? verificationResult.givenUpChecks
      : await this.findChecksWithRecordsInPlace({
          domain: emailingDomain.domain,
          checks: verificationResult.givenUpChecks,
        });

    if (!isNonEmptyArray(checksToRestart)) {
      return verificationResult;
    }

    for (const check of checksToRestart) {
      await emailingDomainDriver
        .restartVerification({ ...resourceInput, check })
        .catch((error) => {
          this.logger.warn(
            `Could not restart ${check.name} verification of emailing domain ${emailingDomain.domain} of workspace ${emailingDomain.workspaceId}: ${error}`,
          );
        });
    }

    return emailingDomainDriver.verifyDomain(resourceInput);
  }

  private async findChecksWithRecordsInPlace({
    domain,
    checks,
  }: {
    domain: string;
    checks: EmailingDomainVerificationCheck[];
  }): Promise<EmailingDomainVerificationCheck[]> {
    const checksWithDnsState = await Promise.all(
      checks.map(async (check) => ({
        check,
        dnsState: await lookupDnsRecordsState(
          check.records.map((record) => ({
            ...record,
            key: qualifyDnsRecordName({ name: record.key, domain }),
          })),
        ),
      })),
    );

    return checksWithDnsState
      .filter(({ dnsState }) => dnsState === 'found')
      .map(({ check }) => check);
  }

  private async findEmailingDomainByIdOrThrow(
    workspaceId: string,
    emailingDomainId: string,
  ): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      {
        where: { id: emailingDomainId },
      },
    );

    if (!emailingDomain) {
      throw new EmailingDomainDriverException(
        'Emailing domain not found',
        EmailingDomainDriverExceptionCode.NOT_FOUND,
      );
    }

    return emailingDomain;
  }

  private async deleteRemoteEmailingDomain(
    emailingDomain: EmailingDomainEntity,
  ): Promise<void> {
    try {
      await this.emailingDomainDriverFactory.getCurrentDriver().cleanupDomain({
        domain: emailingDomain.domain,
        workspaceId: emailingDomain.workspaceId,
      });
    } catch (error) {
      this.logger.warn(
        `Remote cleanup for emailing domain ${emailingDomain.domain} (workspace ${emailingDomain.workspaceId}) failed: ${error}`,
      );
    }
  }
}
