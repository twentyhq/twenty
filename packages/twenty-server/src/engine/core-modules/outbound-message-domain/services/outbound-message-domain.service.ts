import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { OutboundMessageDomainDriverFactory } from 'src/engine/core-modules/outbound-message-domain/drivers/outbound-message-domain-driver.factory';
import {
  OutboundMessageDomainDriver,
  OutboundMessageDomainStatus,
} from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';
import { OutboundMessageDomain } from 'src/engine/core-modules/outbound-message-domain/outbound-message-domain.entity';
import { type Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class OutboundMessageDomainService {
  constructor(
    @InjectRepository(OutboundMessageDomain)
    private readonly outboundMessageDomainRepository: Repository<OutboundMessageDomain>,
    private readonly outboundMessageDomainDriverFactory: OutboundMessageDomainDriverFactory,
  ) {}

  async createOutboundMessageDomain(
    domain: string,
    driver: OutboundMessageDomainDriver,
    workspace: Workspace,
  ): Promise<OutboundMessageDomain> {
    const existingDomain = await this.outboundMessageDomainRepository.findOneBy(
      {
        domain,
        workspaceId: workspace.id,
      },
    );

    if (existingDomain) {
      throw new Error(
        'Outbound message domain already exists for this workspace',
      );
    }

    const domainToCreate = {
      domain,
      driver: driver,
      status: OutboundMessageDomainStatus.PENDING,
      workspaceId: workspace.id,
    } as OutboundMessageDomain;

    const driverInstance =
      this.outboundMessageDomainDriverFactory.getCurrentDriver();
    const verifiedDomain = await driverInstance.verifyDomain(domainToCreate);

    const savedDomain =
      await this.outboundMessageDomainRepository.save(verifiedDomain);

    return savedDomain;
  }

  async deleteOutboundMessageDomain(
    workspace: Workspace,
    outboundMessageDomainId: string,
  ): Promise<void> {
    const outboundMessageDomain =
      await this.outboundMessageDomainRepository.findOneBy({
        id: outboundMessageDomainId,
        workspaceId: workspace.id,
      });

    if (!outboundMessageDomain) {
      throw new Error('Outbound message domain not found');
    }

    await this.outboundMessageDomainRepository.delete({
      id: outboundMessageDomain.id,
    });
  }

  async getOutboundMessageDomains(
    workspace: Workspace,
  ): Promise<OutboundMessageDomain[]> {
    return await this.outboundMessageDomainRepository.find({
      where: {
        workspaceId: workspace.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getOutboundMessageDomain(
    workspace: Workspace,
    outboundMessageDomainId: string,
  ): Promise<OutboundMessageDomain | null> {
    return await this.outboundMessageDomainRepository.findOneBy({
      id: outboundMessageDomainId,
      workspaceId: workspace.id,
    });
  }

  async verifyOutboundMessageDomain(
    workspace: Workspace,
    outboundMessageDomainId: string,
  ): Promise<OutboundMessageDomain> {
    const outboundMessageDomain = await this.getOutboundMessageDomain(
      workspace,
      outboundMessageDomainId,
    );

    if (!outboundMessageDomain) {
      throw new Error('Outbound message domain not found');
    }

    if (outboundMessageDomain.status === OutboundMessageDomainStatus.VERIFIED) {
      throw new Error('Outbound message domain is already verified');
    }

    const driver = this.outboundMessageDomainDriverFactory.getCurrentDriver();
    const verifiedDomain = await driver.verifyDomain(outboundMessageDomain);

    const updatedDomain =
      await this.outboundMessageDomainRepository.save(verifiedDomain);

    return updatedDomain;
  }

  async syncOutboundMessageDomain(
    workspace: Workspace,
    outboundMessageDomainId: string,
  ): Promise<OutboundMessageDomain> {
    const outboundMessageDomain = await this.getOutboundMessageDomain(
      workspace,
      outboundMessageDomainId,
    );

    if (!outboundMessageDomain) {
      throw new Error('Outbound message domain not found');
    }

    await this.outboundMessageDomainRepository.update(
      {
        id: outboundMessageDomainId,
      },
      {
        verificationRecords: outboundMessageDomain.verificationRecords,
        status: OutboundMessageDomainStatus.PENDING,
      },
    );

    try {
      const driver = this.outboundMessageDomainDriverFactory.getCurrentDriver();
      const syncedDomain = await driver.getDomainStatus(outboundMessageDomain);

      const updatedDomain =
        await this.outboundMessageDomainRepository.save(syncedDomain);

      return updatedDomain;
    } catch (error) {
      await this.outboundMessageDomainRepository.update(
        { id: outboundMessageDomainId },
        {
          verificationRecords: outboundMessageDomain.verificationRecords,
          status: outboundMessageDomain.status,
        },
      );

      throw error;
    }
  }
}
