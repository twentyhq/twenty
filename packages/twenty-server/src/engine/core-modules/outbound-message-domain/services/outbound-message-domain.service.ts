import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BaseDriverConfig } from 'src/engine/core-modules/outbound-message-domain/drivers/interfaces/driver-config.interface';

import { OutboundMessageDomainDriverFactory } from 'src/engine/core-modules/outbound-message-domain/drivers/outbound-message-domain-driver.factory';
import {
  OutboundMessageDomainStatus,
  OutboundMessageDomainSyncStatus,
} from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';
import { CreateOutboundMessageDomainInput } from 'src/engine/core-modules/outbound-message-domain/dtos/create-outbound-message-domain.input';
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
    createOutboundMessageDomainInput: CreateOutboundMessageDomainInput,
    workspace: Workspace,
  ): Promise<OutboundMessageDomain> {
    const existingDomain = await this.outboundMessageDomainRepository.findOneBy(
      {
        domain: createOutboundMessageDomainInput.domain,
        workspaceId: workspace.id,
      },
    );

    if (existingDomain) {
      throw new Error(
        'Outbound message domain already exists for this workspace',
      );
    }

    const outboundMessageDomain =
      await this.outboundMessageDomainRepository.save({
        domain: createOutboundMessageDomainInput.domain,
        driver: createOutboundMessageDomainInput.driver,
        driverConfig: createOutboundMessageDomainInput.driverConfig || {},
        status: OutboundMessageDomainStatus.PENDING,
        syncStatus: OutboundMessageDomainSyncStatus.NOT_SYNCED,
        workspaceId: workspace.id,
      });

    return outboundMessageDomain;
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
    verificationToken?: string,
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

    // Set sync status to syncing
    await this.outboundMessageDomainRepository.update(
      { id: outboundMessageDomainId },
      { syncStatus: OutboundMessageDomainSyncStatus.SYNCING },
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
          syncStatus: OutboundMessageDomainSyncStatus.FAILED,
          syncError: error instanceof Error ? error.message : 'Unknown error',
        },
      );

      throw error;
    }
  }

  async getVerificationToken(
    workspace: Workspace,
    outboundMessageDomainId: string,
  ): Promise<string> {
    const outboundMessageDomain = await this.getOutboundMessageDomain(
      workspace,
      outboundMessageDomainId,
    );

    if (!outboundMessageDomain) {
      throw new Error('Outbound message domain not found');
    }

    const driver = this.outboundMessageDomainDriverFactory.getCurrentDriver();

    return await driver.getDomainVerificationRecords(
      outboundMessageDomain.domain,
      outboundMessageDomain.driverConfig as unknown as BaseDriverConfig,
    );
  }
}
