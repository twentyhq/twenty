import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { AiAgentConfig } from 'src/engine/core-modules/ai-agent-config/ai-agent-config.entity';
import { AiAgentConfigFilterInput } from 'src/engine/core-modules/ai-agent-config/dtos/ai-agent-config-filter.input';
import { CreateAiAgentConfigInput } from 'src/engine/core-modules/ai-agent-config/dtos/create-ai-agent-config.input';
import { UpdateAiAgentConfigInput } from 'src/engine/core-modules/ai-agent-config/dtos/update-ai-agent-config.input';

@Injectable()
export class AiAgentConfigService {
  constructor(
    @InjectRepository(AiAgentConfig, 'core')
    private readonly aiAgentConfigRepository: Repository<AiAgentConfig>,
  ) {}

  async findOne(
    filter: AiAgentConfigFilterInput,
    workspaceId: string,
  ): Promise<AiAgentConfig | null> {
    const whereCondition: any = {
      workspaceId,
      deletedAt: IsNull(),
    };

    // Add filter conditions if provided
    if (filter.objectMetadataId) {
      whereCondition.objectMetadataId = filter.objectMetadataId;
    }
    if (filter.viewId) {
      whereCondition.viewId = filter.viewId;
    }
    if (filter.fieldMetadataId) {
      whereCondition.fieldMetadataId = filter.fieldMetadataId;
    }
    if (filter.viewGroupId) {
      whereCondition.viewGroupId = filter.viewGroupId;
    }
    if (filter.agent) {
      whereCondition.agent = filter.agent;
    }
    if (filter.status) {
      whereCondition.status = filter.status;
    }

    return this.aiAgentConfigRepository.findOne({
      where: whereCondition,
    });
  }

  async create(
    input: CreateAiAgentConfigInput,
    workspaceId: string,
  ): Promise<AiAgentConfig> {
    // Check if a config with the same workspaceId, fieldMetadataId, and viewGroupId combination already exists
    if (input.fieldMetadataId && input.viewGroupId) {
      const existingConfig = await this.aiAgentConfigRepository.findOne({
        where: {
          workspaceId,
          fieldMetadataId: input.fieldMetadataId,
          viewGroupId: input.viewGroupId,
          deletedAt: IsNull(),
        },
      });

      if (existingConfig) {
        throw new Error(
          `AI Agent Config already exists`,
        );
      }
    }

    const aiAgentConfig = this.aiAgentConfigRepository.create({
      ...input,
      workspaceId,
      wipLimit: input.wipLimit ?? 3,
    });

    return this.aiAgentConfigRepository.save(aiAgentConfig);
  }

  async update(
    id: string,
    input: UpdateAiAgentConfigInput,
    workspaceId: string,
  ): Promise<AiAgentConfig> {
    const existingConfig = await this.aiAgentConfigRepository.findOne({
      where: { id, workspaceId, deletedAt: IsNull() },
    });

    if (!existingConfig) {
      throw new Error('AI Agent Config not found');
    }

    Object.assign(existingConfig, input);
    return this.aiAgentConfigRepository.save(existingConfig);
  }

  async delete(id: string, workspaceId: string): Promise<boolean> {
    const existingConfig = await this.aiAgentConfigRepository.findOne({
      where: { id, workspaceId, deletedAt: IsNull() },
    });

    if (!existingConfig) {
      throw new Error('AI Agent Config not found');
    }

    await this.aiAgentConfigRepository.softDelete(id);
    return true;
  }
} 