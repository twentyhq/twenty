import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import {
  EmailingDomainDriver,
  EmailingDomainStatus,
} from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class EmailingDomainService {
  constructor(
    @InjectRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: Repository<EmailingDomainEntity>,
    private readonly emailingDomainDriverFactory: EmailingDomainDriverFactory,
  ) {}

  async createEmailingDomain(
    domain: string,
    driver: EmailingDomainDriver,
    workspace: WorkspaceEntity,
  ): Promise<EmailingDomainEntity> {
    const existingDomain = await this.emailingDomainRepository.findOneBy({
      domain,
      workspaceId: workspace.id,
    });

    if (existingDomain) {
      throw new Error('Emailing domain already exists for this workspace');
    }

    const driverInstance = this.emailingDomainDriverFactory.getCurrentDriver();
    const verificationResult = await driverInstance.verifyDomain({
      domain,
      workspaceId: workspace.id,
    });

    const domainToCreate = {
      domain,
      driver,
      workspaceId: workspace.id,
      ...verificationResult,
    };

    const savedDomain =
      await this.emailingDomainRepository.save(domainToCreate);

    return savedDomain;
  }

  async deleteEmailingDomain(
    workspace: WorkspaceEntity,
    emailingDomainId: string,
  ): Promise<void> {
    const emailingDomain = await this.emailingDomainRepository.findOneBy({
      id: emailingDomainId,
      workspaceId: workspace.id,
    });

    if (!emailingDomain) {
      throw new Error('Emailing domain not found');
    }

    await this.emailingDomainRepository.delete({
      id: emailingDomain.id,
    });
  }

  async getEmailingDomains(
    workspace: WorkspaceEntity,
  ): Promise<EmailingDomainEntity[]> {
    return await this.emailingDomainRepository.find({
      where: {
        workspaceId: workspace.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getEmailingDomain(
    workspace: WorkspaceEntity,
    emailingDomainId: string,
  ): Promise<EmailingDomainEntity | null> {
    return await this.emailingDomainRepository.findOneBy({
      id: emailingDomainId,
      workspaceId: workspace.id,
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

    const updatedDomain = await this.emailingDomainRepository.save({
      ...emailingDomain,
      ...verificationResult,
    });

    return updatedDomain;
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
      {
        id: emailingDomainId,
      },
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

      const updatedDomain = await this.emailingDomainRepository.save({
        ...emailingDomain,
        ...statusResult,
      });

      return updatedDomain;
    } catch (error) {
      await this.emailingDomainRepository.update(
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
