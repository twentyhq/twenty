import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ArrayContains, Repository } from 'typeorm';

import {
    GraphqlQueryRunnerException,
    GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

import { WebhookEntity } from './webhook.entity';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookEntity, 'core')
    private readonly webhookRepository: Repository<WebhookEntity>,
  ) {}

  validateWebhookUrl(targetUrl: string): void {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      throw new GraphqlQueryRunnerException(
        `Invalid URL: missing scheme. URLs must include http:// or https://. Received: ${targetUrl}`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new GraphqlQueryRunnerException(
        `Invalid URL scheme. Only HTTP and HTTPS are allowed. Received: ${parsedUrl.protocol}`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }

  async findByWorkspaceId(workspaceId: string): Promise<WebhookEntity[]> {
    return this.webhookRepository.find({
      where: { workspaceId },
    });
  }

  // This method replicates the EXACT business logic from CallWebhookJobsJob
  async findByWorkspaceIdAndOperationPatterns(
    workspaceId: string,
    nameSingular: string,
    operation: string,
  ): Promise<WebhookEntity[]> {
    return this.webhookRepository.find({
      where: [
        {
          workspaceId,
          operations: ArrayContains([`${nameSingular}.${operation}`]),
        },
        {
          workspaceId,
          operations: ArrayContains([`*.${operation}`]),
        },
        {
          workspaceId,
          operations: ArrayContains([`${nameSingular}.*`]),
        },
        {
          workspaceId,
          operations: ArrayContains(['*.*']),
        },
      ],
    });
  }

  async create(webhookData: Partial<WebhookEntity>): Promise<WebhookEntity> {
    const webhook = this.webhookRepository.create(webhookData);

    return this.webhookRepository.save(webhook);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<WebhookEntity>,
  ): Promise<WebhookEntity | null> {
    await this.webhookRepository.update({ id, workspaceId }, updateData);

    return this.findById(id, workspaceId);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<WebhookEntity | null> {
    return this.webhookRepository.findOne({
      where: { id, workspaceId },
    });
  }

  async delete(id: string, workspaceId: string): Promise<boolean> {
    const result = await this.webhookRepository.softDelete({ id, workspaceId });

    return (result.affected ?? 0) > 0;
  }
}
