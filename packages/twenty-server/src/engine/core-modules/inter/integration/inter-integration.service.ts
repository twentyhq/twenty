import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/create-inter-integration.input';
import { UpdateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/update-inter-integration.input';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { InterIntegration } from './inter-integration.entity';

@Injectable()
export class InterIntegrationService {
  constructor(
    @InjectRepository(InterIntegration, 'core')
    private interIntegrationRepository: Repository<InterIntegration>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async create(
    createInput: CreateInterIntegrationInput,
  ): Promise<InterIntegration> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: createInput.workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const integration = this.interIntegrationRepository.create({
      ...createInput,
      workspace,
      status: 'active',
    });

    return await this.interIntegrationRepository.save(integration);
  }

  async findAll(workspaceId: string): Promise<InterIntegration[]> {
    return this.interIntegrationRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });
  }

  async findById(id: string): Promise<InterIntegration | null> {
    return this.interIntegrationRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });
  }

  async update(
    updateInput: UpdateInterIntegrationInput,
  ): Promise<InterIntegration> {
    const integration = await this.interIntegrationRepository.findOne({
      where: { id: updateInput.id },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    const updatedIntegration = this.interIntegrationRepository.merge(
      integration,
      updateInput,
    );

    return await this.interIntegrationRepository.save(updatedIntegration);
  }

  async toggleStatus(id: string): Promise<InterIntegration> {
    const integration = await this.findById(id);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    integration.status =
      integration.status === 'active' ? 'inactive' : 'active';

    return await this.interIntegrationRepository.save(integration);
  }

  /*async delete(id: string): Promise<boolean> {
    const result = await this.interIntegrationRepository.delete(id);

    if (result) {
      return result.affected > 0;
    } else {
      return 0;
    }
  }*/
}
