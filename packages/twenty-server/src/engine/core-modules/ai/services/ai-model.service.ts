import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AIModel,
  ModelProvider,
} from 'src/engine/core-modules/ai/entities/ai-model.entity';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
}

@Injectable()
export class AIModelService {
  private readonly logger = new Logger(AIModelService.name);

  constructor(
    @InjectRepository(AIModel, 'core')
    private readonly aiModelRepository: Repository<AIModel>,
  ) {}

  async findAll(): Promise<AIModel[]> {
    return this.aiModelRepository.find({
      where: { isActive: true },
      order: { displayName: 'ASC' },
    });
  }

  async findByProvider(provider: ModelProvider): Promise<AIModel[]> {
    return this.aiModelRepository.find({
      where: { provider, isActive: true },
      order: { displayName: 'ASC' },
    });
  }

  async findById(modelId: string): Promise<AIModel | null> {
    return this.aiModelRepository.findOne({
      where: { modelId, isActive: true },
    });
  }

  async create(aiModel: Partial<AIModel>): Promise<AIModel> {
    const newModel = this.aiModelRepository.create(aiModel);

    return this.aiModelRepository.save(newModel);
  }

  async update(
    modelId: string,
    updates: Partial<AIModel>,
  ): Promise<AIModel | null> {
    await this.aiModelRepository.update(modelId, updates);

    return this.findById(modelId);
  }

  async delete(modelId: string): Promise<boolean> {
    const result = await this.aiModelRepository.update(modelId, {
      isActive: false,
    });

    return (result.affected ?? 0) > 0;
  }
}
