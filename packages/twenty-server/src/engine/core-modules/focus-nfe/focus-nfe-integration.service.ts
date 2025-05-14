import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BadRequestException } from '@nestjs/common';
import { CreateFocusNfeIntegrationInput } from 'src/engine/core-modules/focus-nfe/dtos/create-focus-nfe-integration.input';
import { UpdateFocusNfeIntegrationInput } from 'src/engine/core-modules/focus-nfe/dtos/update-focus-nfe-integration.input';
import { FocusNfeIntegration } from 'src/engine/core-modules/focus-nfe/focus-nfe-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export class FocusNfeService {
  constructor(
    @InjectRepository(FocusNfeIntegration, 'core')
    private readonly focusNfeRepository: Repository<FocusNfeIntegration>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly dataSourceService: DataSourceService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async create(
    createInput: CreateFocusNfeIntegrationInput,
  ): Promise<FocusNfeIntegration> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: createInput.workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const createdFocusNfeIntegration = this.focusNfeRepository.create({
      ...createInput,
      workspace,
    });

    return await this.focusNfeRepository.save(createdFocusNfeIntegration);
  }

  async findAll(workspaceId: string): Promise<FocusNfeIntegration[]> {
    return await this.focusNfeRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(
    focusNfeIntegrationId: string,
  ): Promise<FocusNfeIntegration | null> {
    return await this.focusNfeRepository.findOne({
      where: { id: focusNfeIntegrationId },
      relations: ['workspace'],
    });
  }

  async update(
    updateInput: UpdateFocusNfeIntegrationInput,
  ): Promise<FocusNfeIntegration> {
    const focusNfeIntegration = await this.focusNfeRepository.findOne({
      where: { id: updateInput.id },
      relations: ['workspace'],
    });

    if (!focusNfeIntegration) {
      throw new Error('Focus NFe integration not found');
    }

    const updatedFocusNfeIntegration = {
      ...focusNfeIntegration,
      ...updateInput,
    };

    return await this.focusNfeRepository.save(updatedFocusNfeIntegration);
  }

  async delete(focusNfeIntegrationId: string): Promise<boolean> {
    const focusNfeIntegration = await this.focusNfeRepository.findOne({
      where: { id: focusNfeIntegrationId },
    });

    if (focusNfeIntegration) {
      const { affected } = await this.focusNfeRepository.delete(
        focusNfeIntegrationId,
      );

      if (!affected) {
        throw new BadRequestException(undefined, {
          description: 'Error when removing Focus NFe Integration',
        });
      }

      return affected ? true : false;
    }

    throw new BadRequestException(undefined, {
      description: 'Focus NFe integration not found',
    });
  }
}
