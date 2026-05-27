import { Injectable } from '@nestjs/common';

import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import {
  EmailingDomainDriver,
  EmailingDomainStatus,
} from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  InjectWorkspaceScopedRepository,
  WorkspaceScopedRepository,
} from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class EmailingDomainService {
  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainDriverFactory: EmailingDomainDriverFactory,
  ) {}

  async createEmailingDomain(
    domain: string,
    driver: EmailingDomainDriver,
    workspace: WorkspaceEntity,
  ): Promise<EmailingDomainEntity> {
    const existingDomain = await this.emailingDomainRepository.findOne(
      workspace.id,
      {
        where: { domain },
      },
    );

    if (existingDomain) {
      throw new Error('Emailing domain already exists for this workspace');
    }

    const driverInstance = this.emailingDomainDriverFactory.getCurrentDriver();
    const verificationResult = await driverInstance.verifyDomain({
      domain,
      workspaceId: workspace.id,
    });

    return this.emailingDomainRepository.save(workspace.id, {
      domain,
      driver,
      ...verificationResult,
    });
  }

  async deleteEmailingDomain(
    workspace: WorkspaceEntity,
    emailingDomainId: string,
  ): Promise<void> {
    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspace.id,
      {
        where: { id: emailingDomainId },
      },
    );

    if (!emailingDomain) {
      throw new Error('Emailing domain not found');
    }

    await this.emailingDomainRepository.delete(workspace.id, {
      id: emailingDomain.id,
    });
  }

  async getEmailingDomains(
    workspace: WorkspaceEntity,
  ): Promise<EmailingDomainEntity[]> {
    return this.emailingDomainRepository.find(workspace.id, {
      order: { createdAt: 'DESC' },
    });
  }

  async getEmailingDomain(
    workspace: WorkspaceEntity,
    emailingDomainId: string,
  ): Promise<EmailingDomainEntity | null> {
    return this.emailingDomainRepository.findOne(workspace.id, {
      where: { id: emailingDomainId },
    });
  }

  async verifyEmailingDomain(
    workspace: WorkspaceEntity,
    emailingDomainId: string,
  ): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.getEmailingDomain(
      workspace,
      emailingDomainId,
    );

    if (!emailingDomain) {
      throw new Error('Emailing domain not found');
    }

    if (emailingDomain.status === EmailingDomainStatus.VERIFIED) {
      throw new Error('Emailing domain is already verified');
    }

    const driver = this.emailingDomainDriverFactory.getCurrentDriver();
    const verificationResult = await driver.verifyDomain({
      domain: emailingDomain.domain,
      workspaceId: emailingDomain.workspaceId,
    });

    return this.emailingDomainRepository.save(workspace.id, {
      ...emailingDomain,
      ...verificationResult,
    });
  }

  async syncEmailingDomain(
    workspace: WorkspaceEntity,
    emailingDomainId: string,
  ): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.getEmailingDomain(
      workspace,
      emailingDomainId,
    );

    if (!emailingDomain) {
      throw new Error('Emailing domain not found');
    }

    await this.emailingDomainRepository.update(
      workspace.id,
      { id: emailingDomainId },
      {
        verificationRecords: emailingDomain.verificationRecords,
        status: EmailingDomainStatus.PENDING,
      },
    );

    try {
      const driver = this.emailingDomainDriverFactory.getCurrentDriver();
      const statusResult = await driver.getDomainStatus({
        domain: emailingDomain.domain,
        workspaceId: emailingDomain.workspaceId,
      });

      return this.emailingDomainRepository.save(workspace.id, {
        ...emailingDomain,
        ...statusResult,
      });
    } catch (error) {
      await this.emailingDomainRepository.update(
        workspace.id,
        { id: emailingDomainId },
        {
          verificationRecords: emailingDomain.verificationRecords,
          status: emailingDomain.status,
        },
      );

      throw error;
    }
  }
}
