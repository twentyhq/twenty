import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/create-whatsapp-integration.input';
import { UpdateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/update-whatsapp-integration.input';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export class WhatsappIntegrationService {
  constructor(
    @InjectRepository(WhatsappIntegration, 'core')
    private whatsappIntegrationRepository: Repository<WhatsappIntegration>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async create(
    createInput: CreateWhatsappIntegrationInput,
  ): Promise<WhatsappIntegration> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: createInput.workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const createIntegration = this.whatsappIntegrationRepository.create({
      ...createInput,
      workspace: workspace,
      sla: 30,
    });

    await this.whatsappIntegrationRepository.save(createIntegration);

    return createIntegration;
  }

  async findAll(workspaceId: string): Promise<WhatsappIntegration[]> {
    return await this.whatsappIntegrationRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: [`workspace`],
    });
  }

  async findById(id: string): Promise<WhatsappIntegration | null> {
    return await this.whatsappIntegrationRepository.findOne({
      where: { id },
    });
  }

  async update(
    updateInput: UpdateWhatsappIntegrationInput,
  ): Promise<WhatsappIntegration> {
    const integration = await this.whatsappIntegrationRepository.findOne({
      where: { id: updateInput.id },
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    const updateIntegration = {
      ...integration,
      ...updateInput,
    };

    await this.whatsappIntegrationRepository.save(updateIntegration);

    return updateIntegration;
  }

  async toggleStatus(integrationId: string): Promise<boolean> {
    const integration = await this.findById(integrationId);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    integration.disabled = !integration.disabled;

    await this.whatsappIntegrationRepository.save(integration);

    return integration.disabled;
  }

  async updateServiceLevel(
    integrationId: string,
    sla: number,
  ): Promise<WhatsappIntegration> {
    const integration = await this.findById(integrationId);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    integration.sla = sla;

    await this.whatsappIntegrationRepository.save(integration);

    return integration;
  }
}
