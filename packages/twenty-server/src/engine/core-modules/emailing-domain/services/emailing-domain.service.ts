import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyArray } from '@sniptt/guards';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import {
  EMAIL_SEND_AWS_COST_PER_RECIPIENT_USD,
  EMAIL_SEND_CREDIT_MARKUP,
  EMAIL_SEND_THROTTLE_MAX_RECIPIENTS,
  EMAIL_SEND_THROTTLE_WINDOW_MS,
} from 'src/engine/core-modules/emailing-domain/constants/email-send-billing.constant';
import { EMAIL_MAX_TOTAL_RECIPIENTS } from 'src/engine/core-modules/emailing-domain/constants/email-limits.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import {
  type EmailingDomainEmailContent,
  type EmailingDomainSendEmailResult,
} from 'src/engine/core-modules/emailing-domain/drivers/types/send-email';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailGroupSuppressionService } from 'src/engine/core-modules/emailing-domain/services/email-group-suppression.service';
import { EmailGroupUnsubscribeService } from 'src/engine/core-modules/emailing-domain/services/email-group-unsubscribe.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DOLLAR_TO_CREDIT_MULTIPLIER } from 'src/engine/metadata-modules/ai/ai-billing/constants/dollar-to-credit-multiplier';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
@Injectable()
export class EmailingDomainService {
  private readonly logger = new Logger(EmailingDomainService.name);

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainDriverFactory: EmailingDomainDriverFactory,
    private readonly emailGroupSuppressionService: EmailGroupSuppressionService,
    private readonly emailGroupUnsubscribeService: EmailGroupUnsubscribeService,
    private readonly throttlerService: ThrottlerService,
    private readonly billingUsageService: BillingUsageService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async createEmailingDomain(
    domain: string,
    driverType: EmailingDomainDriver,
    workspace: WorkspaceEntity,
  ): Promise<EmailingDomainEntity> {
    const existingEmailingDomain = await this.emailingDomainRepository.findOne(
      workspace.id,
      {
        where: { domain },
      },
    );

    if (existingEmailingDomain) {
      throw new EmailingDomainDriverException(
        'Emailing domain already exists for this workspace',
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    const emailingDomainDriver =
      this.emailingDomainDriverFactory.getCurrentDriver();

    await emailingDomainDriver.provisionWorkspace(workspace.id);

    const verificationResult = await emailingDomainDriver.verifyDomain({
      domain,
      workspaceId: workspace.id,
    });

    await emailingDomainDriver.registerDomain({
      domain,
      workspaceId: workspace.id,
    });

    const isVerifiedOnCreation =
      verificationResult.status === EmailingDomainStatus.VERIFIED;

    return this.emailingDomainRepository.save(workspace.id, {
      domain,
      driver: driverType,
      status: verificationResult.status,
      verificationRecords: verificationResult.verificationRecords,
      verifiedAt: isVerifiedOnCreation ? new Date() : null,
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

    await this.deleteRemoteEmailingDomain(emailingDomain);
    await this.emailingDomainRepository.delete(workspace.id, {
      id: emailingDomain.id,
    });
  }

  async cleanupEmailingDomainsForWorkspace(
    workspaceId: string,
    domains: string[],
  ): Promise<void> {
    const emailingDomainDriver =
      this.emailingDomainDriverFactory.getCurrentDriver();

    for (const domain of domains) {
      await emailingDomainDriver.cleanupDomain({ domain, workspaceId });
    }

    await emailingDomainDriver.deprovisionWorkspace(workspaceId);
  }

  async getEmailingDomains(
    workspace: WorkspaceEntity,
  ): Promise<EmailingDomainEntity[]> {
    return this.emailingDomainRepository.find(workspace.id, {
      order: { createdAt: 'DESC' },
    });
  }

  async verifyEmailingDomain(
    workspace: WorkspaceEntity,
    emailingDomainId: string,
  ): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.findEmailingDomainByIdOrThrow(
      workspace.id,
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
      workspace.id,
      { id: emailingDomain.id },
      {
        status: verificationResult.status,
        verificationRecords: verificationResult.verificationRecords,
        ...(hasJustBecomeVerified ? { verifiedAt: new Date() } : {}),
      },
    );

    return this.emailingDomainRepository.findOneOrFail(workspace.id, {
      where: { id: emailingDomain.id },
    });
  }

  async sendEmail(
    workspaceId: string,
    emailingDomainId: string,
    emailContent: EmailingDomainEmailContent,
  ): Promise<EmailingDomainSendEmailResult> {
    const emailingDomain = await this.findEmailingDomainByIdOrThrow(
      workspaceId,
      emailingDomainId,
    );

    if (emailingDomain.status !== EmailingDomainStatus.VERIFIED) {
      throw new EmailingDomainDriverException(
        `Emailing domain is not verified (status: ${emailingDomain.status})`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    if (emailingDomain.tenantStatus !== EmailingDomainTenantStatus.ACTIVE) {
      throw new EmailingDomainDriverException(
        `Sending is suspended for emailing domain ${emailingDomain.domain} (tenantStatus: ${emailingDomain.tenantStatus})`,
        EmailingDomainDriverExceptionCode.SENDING_SUSPENDED,
      );
    }

    const fromAddressDomain = emailContent.from.split('@')[1]?.toLowerCase();

    if (fromAddressDomain !== emailingDomain.domain.toLowerCase()) {
      throw new EmailingDomainDriverException(
        `From address ${emailContent.from} does not match verified domain ${emailingDomain.domain}`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    const suppressedAddresses =
      await this.emailGroupSuppressionService.getSuppressedAddresses(
        workspaceId,
        [
          ...emailContent.to,
          ...(emailContent.cc ?? []),
          ...(emailContent.bcc ?? []),
        ],
      );

    const isNotSuppressed = (address: string): boolean =>
      !suppressedAddresses.has(address.trim().toLowerCase());

    const deliverableTo = emailContent.to.filter(isNotSuppressed);

    if (deliverableTo.length === 0) {
      throw new EmailingDomainDriverException(
        `All primary recipients are suppressed for emailing domain ${emailingDomain.domain}`,
        EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED,
      );
    }

    const deliverableCc = emailContent.cc?.filter(isNotSuppressed);
    const deliverableBcc = emailContent.bcc?.filter(isNotSuppressed);

    const recipientCount =
      deliverableTo.length +
      (deliverableCc?.length ?? 0) +
      (deliverableBcc?.length ?? 0);

    if (recipientCount > EMAIL_MAX_TOTAL_RECIPIENTS) {
      throw new EmailingDomainDriverException(
        `A single email cannot exceed ${EMAIL_MAX_TOTAL_RECIPIENTS} recipients`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    await this.assertBillingAllowsSending(workspaceId);
    await this.assertWithinSendRate(workspaceId, recipientCount);

    const headers = this.buildSingleRecipientUnsubscribeHeaders(
      workspaceId,
      emailContent,
      deliverableTo,
      deliverableCc,
      deliverableBcc,
    );

    const result = await this.emailingDomainDriverFactory
      .getCurrentDriver()
      .sendEmail({
        ...emailContent,
        to: deliverableTo,
        cc: deliverableCc,
        bcc: deliverableBcc,
        headers,
        workspaceId,
        domain: emailingDomain.domain,
      });

    this.meterEmailSend(workspaceId, recipientCount);

    return result;
  }

  private async assertBillingAllowsSending(workspaceId: string): Promise<void> {
    const canSend =
      await this.billingUsageService.canFeatureBeUsed(workspaceId);

    if (!canSend) {
      throw new EmailingDomainDriverException(
        'Email sending is not available for this workspace billing plan',
        EmailingDomainDriverExceptionCode.SENDING_SUSPENDED,
      );
    }
  }

  private async assertWithinSendRate(
    workspaceId: string,
    recipientCount: number,
  ): Promise<void> {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      `emailing-domain-send:${workspaceId}`,
      recipientCount,
      EMAIL_SEND_THROTTLE_MAX_RECIPIENTS,
      EMAIL_SEND_THROTTLE_WINDOW_MS,
    );
  }

  private meterEmailSend(workspaceId: string, recipientCount: number): void {
    const creditsUsedMicro = Math.round(
      EMAIL_SEND_AWS_COST_PER_RECIPIENT_USD *
        EMAIL_SEND_CREDIT_MARKUP *
        DOLLAR_TO_CREDIT_MULTIPLIER *
        recipientCount,
    );

    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.API,
          operationType: UsageOperationType.EMAIL_SEND,
          creditsUsedMicro,
          quantity: recipientCount,
          unit: UsageUnit.INVOCATION,
        },
      ],
      workspaceId,
    );
  }

  private buildSingleRecipientUnsubscribeHeaders(
    workspaceId: string,
    emailContent: EmailingDomainEmailContent,
    deliverableTo: string[],
    deliverableCc: string[] | undefined,
    deliverableBcc: string[] | undefined,
  ): EmailingDomainEmailContent['headers'] {
    const isSingleRecipient =
      deliverableTo.length === 1 &&
      !isNonEmptyArray(deliverableCc) &&
      !isNonEmptyArray(deliverableBcc);

    if (emailContent.includeUnsubscribe !== true || !isSingleRecipient) {
      return emailContent.headers;
    }

    return [
      ...(emailContent.headers ?? []),
      ...this.emailGroupUnsubscribeService.buildUnsubscribeHeaders(
        workspaceId,
        deliverableTo[0],
      ),
    ];
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
