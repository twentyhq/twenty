import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ArrayContains, IsNull, Repository } from 'typeorm';

import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';

// Legacy webhook service for backward compatibility with jobs
// Main webhook CRUD operations are handled by the new WebhookService in metadata-modules
@Injectable()
export class WebhookQueryService {
  constructor(
    @InjectRepository(WebhookEntity)
    private readonly webhookRepository: Repository<WebhookEntity>,
  ) {}

  async findByOperations(
    workspaceId: string,
    operations: string[],
  ): Promise<WebhookEntity[]> {
    return this.webhookRepository.find({
      where: operations.map((operation) => ({
        workspaceId,
        operations: ArrayContains([operation]),
        deletedAt: IsNull(),
      })),
    });
  }
}
