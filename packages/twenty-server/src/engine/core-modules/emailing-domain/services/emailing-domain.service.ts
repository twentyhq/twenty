import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { UnsubscribeHostnameService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-hostname.service';
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
    private readonly unsubscribeHostnameService: UnsubscribeHostnameService,
  ) {}

  async createEmailingDomain(
    domain: string,
    workspaceId: string,
  ): Promise<EmailingDomainEntity> {
    const existingEmailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
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

    const emailingDomain = await this.emailingDomainRepository.save(
      workspaceId,
      {
        domain,
        status: verificationResult.status,
        verificationRecords: verificationResult.verificationRecords,
        verifiedAt: isVerifiedOnCreation ? new Date() : null,
      },
    );

    if (isVerifiedOnCreation) {
      await this.unsubscribeHostnameService.sync(
        workspaceId,
        emailingDomain.id,
        {
          provision: true,
        },
      );
    }

    return this.unsubscribeHostnameService.withDnsRecords(
      await this.emailingDomainRepository.findOneOrFail(workspaceId, {
        where: { id: emailingDomain.id },
      }),
    );
  }

  // Creates the emailing domain for a workspace only if it doesn't exist yet.
  // Used when adding an email channel auto-provisions its domain.
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

  // Deletes the emailing domain for a workspace by its domain name, if present.
  // Used to clean up a domain once its last email channel is removed.
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

    await this.unsubscribeHostnameService.deprovision(emailingDomain);
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
    const emailingDomains = await this.emailingDomainRepository.find(
      workspace.id,
      {
        order: { createdAt: 'DESC' },
      },
    );

    return Promise.all(
      emailingDomains.map((emailingDomain) =>
        this.unsubscribeHostnameService.withDnsRecords(emailingDomain),
      ),
    );
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

    await this.unsubscribeHostnameService.sync(
      workspace.id,
      emailingDomain.id,
      {
        provision: verificationResult.status === EmailingDomainStatus.VERIFIED,
      },
    );

    return this.unsubscribeHostnameService.withDnsRecords(
      await this.emailingDomainRepository.findOneOrFail(workspace.id, {
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
