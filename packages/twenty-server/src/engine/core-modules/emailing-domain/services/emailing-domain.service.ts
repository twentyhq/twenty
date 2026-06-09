import { Injectable, Logger } from '@nestjs/common';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import {
  type EmailingDomainEmailContent,
  type EmailingDomainSendEmailResult,
} from 'src/engine/core-modules/emailing-domain/drivers/types/send-email';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class EmailingDomainService {
  private readonly logger = new Logger(EmailingDomainService.name);

  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainDriverFactory: EmailingDomainDriverFactory,
  ) {}

  async createEmailingDomain(
    domain: string,
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

    return this.emailingDomainDriverFactory.getCurrentDriver().sendEmail({
      ...emailContent,
      workspaceId,
      domain: emailingDomain.domain,
    });
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
