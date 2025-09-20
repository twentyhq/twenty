import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import {
  EmailingDomainDriver,
  EmailingDomainStatus,
} from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain';
import { EmailingDomain } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class EmailingDomainService {
  constructor(
    @InjectRepository(EmailingDomain)
    private readonly emailingDomainRepository: Repository<EmailingDomain>,
    private readonly emailingDomainDriverFactory: EmailingDomainDriverFactory,
  ) {}

  async createEmailingDomain(
    domain: string,
    driver: EmailingDomainDriver,
    workspace: Workspace,
  ): Promise<EmailingDomain> {
    const existingDomain = await this.emailingDomainRepository.findOneBy({
      domain,
      workspaceId: workspace.id,
    });

    if (existingDomain) {
      throw new Error('Emailing domain already exists for this workspace');
    }

    const domainToCreate = {
      domain,
      driver: driver,
      status: EmailingDomainStatus.PENDING,
      workspaceId: workspace.id,
    } as EmailingDomain;

    const driverInstance = this.emailingDomainDriverFactory.getCurrentDriver();
    const verifiedDomain = await driverInstance.verifyDomain(domainToCreate);

    const savedDomain =
      await this.emailingDomainRepository.save(verifiedDomain);

    return savedDomain;
  }

  async deleteEmailingDomain(
    workspace: Workspace,
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

  async getEmailingDomains(workspace: Workspace): Promise<EmailingDomain[]> {
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
    workspace: Workspace,
    emailingDomainId: string,
  ): Promise<EmailingDomain | null> {
    return await this.emailingDomainRepository.findOneBy({
      id: emailingDomainId,
      workspaceId: workspace.id,
    });
  }

  async verifyEmailingDomain(
    workspace: Workspace,
    emailingDomainId: string,
  ): Promise<EmailingDomain> {
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
    const verifiedDomain = await driver.verifyDomain(emailingDomain);

    const updatedDomain =
      await this.emailingDomainRepository.save(verifiedDomain);

    return updatedDomain;
  }

  async syncEmailingDomain(
    workspace: Workspace,
    emailingDomainId: string,
  ): Promise<EmailingDomain> {
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
      const syncedDomain = await driver.getDomainStatus(emailingDomain);

      const updatedDomain =
        await this.emailingDomainRepository.save(syncedDomain);

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
