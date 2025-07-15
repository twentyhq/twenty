import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { ArrayContains, IsNull, Repository } from 'typeorm';

import { Webhook } from './webhook.entity';
import { WebhookException, WebhookExceptionCode } from './webhook.exception';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Webhook, 'core')
    private readonly webhookRepository: Repository<Webhook>,
  ) {}

  private normalizeTargetUrl(targetUrl: string): string {
    try {
      const url = new URL(targetUrl);

      return url.toString();
    } catch {
      return targetUrl;
    }
  }

  private validateTargetUrl(targetUrl: string): boolean {
    try {
      const url = new URL(targetUrl);

      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async findByWorkspaceId(workspaceId: string): Promise<Webhook[]> {
    return this.webhookRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
    });
  }

  async findByOperations(
    workspaceId: string,
    operations: string[],
  ): Promise<Webhook[]> {
    return this.webhookRepository.find({
      where: operations.map((operation) => ({
        workspaceId,
        operations: ArrayContains([operation]),
        deletedAt: IsNull(),
      })),
    });
  }

  async findById(id: string, workspaceId: string): Promise<Webhook | null> {
    const webhook = await this.webhookRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    return webhook || null;
  }

  async create(webhookData: Partial<Webhook>): Promise<Webhook> {
    const normalizedTargetUrl = this.normalizeTargetUrl(
      webhookData.targetUrl || '',
    );

    if (!this.validateTargetUrl(normalizedTargetUrl)) {
      throw new WebhookException(
        'Invalid target URL provided',
        WebhookExceptionCode.INVALID_TARGET_URL,
        { userFriendlyMessage: 'Please provide a valid HTTP or HTTPS URL.' },
      );
    }

    const webhook = this.webhookRepository.create({
      ...webhookData,
      targetUrl: normalizedTargetUrl,
      secret: webhookData.secret,
    });

    return this.webhookRepository.save(webhook);
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<Webhook>,
  ): Promise<Webhook | null> {
    const webhook = await this.findById(id, workspaceId);

    if (!webhook) {
      return null;
    }

    if (isDefined(updateData.targetUrl)) {
      const normalizedTargetUrl = this.normalizeTargetUrl(updateData.targetUrl);

      if (!this.validateTargetUrl(normalizedTargetUrl)) {
        throw new WebhookException(
          'Invalid target URL provided',
          WebhookExceptionCode.INVALID_TARGET_URL,
          { userFriendlyMessage: 'Please provide a valid HTTP or HTTPS URL.' },
        );
      }

      updateData.targetUrl = normalizedTargetUrl;
    }

    await this.webhookRepository.update(id, updateData);

    return this.findById(id, workspaceId);
  }

  async delete(id: string, workspaceId: string): Promise<Webhook | null> {
    const webhook = await this.findById(id, workspaceId);

    if (!webhook) {
      return null;
    }

    await this.webhookRepository.softDelete(id);

    return webhook;
  }
}
