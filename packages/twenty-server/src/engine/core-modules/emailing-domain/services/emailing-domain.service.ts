import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { msg } from '@lingui/core/macro';

import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { In, Repository } from 'typeorm';

import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
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

    const emailingDomainDriver =
      this.emailingDomainDriverFactory.getCurrentDriver();

    await emailingDomainDriver.provisionWorkspace(workspaceId);

    const verificationResult = await emailingDomainDriver.verifyDomain({
      domain,
      workspaceId,
    });

    await emailingDomainDriver.registerDomain({
      domain,
      workspaceId,
    });

    const isVerifiedOnCreation =
      verificationResult.status === EmailingDomainStatus.VERIFIED;

    const emailingDomain =
      await this.emailingDomainRepository.insertAndReturnOne(workspaceId, {
        domain,
        status: verificationResult.status,
        verificationRecords: verificationResult.verificationRecords,
        verifiedAt: isVerifiedOnCreation ? new Date() : null,
      });

    await this.unsubscribeHostnameService.sync(workspaceId, emailingDomain.id, {
      provision: true,
    });

    return this.withDnsRecords(
      await this.emailingDomainRepository.findOneOrFail(workspaceId, {
        where: { id: emailingDomain.id },
      }),
    );
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

    await this.createEmailingDomain(domain, workspaceId);
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

    await this.unsubscribeHostnameService.deprovision(emailingDomain);
    await this.deleteRemoteEmailingDomain(emailingDomain);
    await this.emailingDomainRepository.delete(workspaceId, {
      id: emailingDomain.id,
    });
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

    await this.unsubscribeHostnameService.deprovision(emailingDomain);
    await this.deleteRemoteEmailingDomain(emailingDomain);
    await this.emailingDomainRepository.delete(workspace.id, {
      id: emailingDomain.id,
    });
  }

  async validateNoCampaignSendingOrThrow(workspaceId: string): Promise<void> {
    const isCampaignSending =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const hasSendingCampaign = await this.workspaceOrmManager
          .getRepository(MessageCampaignWorkspaceEntity, {
            shouldBypassPermissionChecks: true,
          })
          .exists({ where: { status: MessageCampaignStatus.SENDING } });

        if (hasSendingCampaign) {
          return true;
        }

        return this.workspaceOrmManager
          .getRepository(CampaignDeliveryWorkspaceEntity, {
            shouldBypassPermissionChecks: true,
          })
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
    const emailingDomain = await this.findEmailingDomainByIdOrThrow(
      workspaceId,
      emailingDomainId,
    );

    const emailingDomainDriver =
      this.emailingDomainDriverFactory.getCurrentDriver();

    const verificationResult = await emailingDomainDriver.verifyDomain({
      domain: emailingDomain.domain,
      workspaceId: emailingDomain.workspaceId,
    });

    const hasJustBecomeVerified =
      emailingDomain.status !== EmailingDomainStatus.VERIFIED &&
      verificationResult.status === EmailingDomainStatus.VERIFIED;

    await this.emailingDomainRepository.update(
      workspaceId,
      { id: emailingDomain.id },
      {
        status: verificationResult.status,
        verificationRecords: verificationResult.verificationRecords,
        ...(hasJustBecomeVerified ? { verifiedAt: new Date() } : {}),
      },
    );

    await this.unsubscribeHostnameService.sync(workspaceId, emailingDomain.id, {
      provision: true,
    });

    return this.withDnsRecords(
      await this.emailingDomainRepository.findOneOrFail(workspaceId, {
        where: { id: emailingDomain.id },
      }),
    );
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
