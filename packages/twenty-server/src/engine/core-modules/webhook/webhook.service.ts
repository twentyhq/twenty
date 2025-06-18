import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { Webhook } from './webhook.entity';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Webhook, 'core')
    private readonly webhookRepository: Repository<Webhook>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  private generateSecret(): string {
    return uuidv4();
  }

  private normalizeTargetUrl(targetUrl: string): string {
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return `https://${targetUrl}`;
    }

    return targetUrl;
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
      where: { workspaceId },
    });
  }

  // This method replicates the EXACT business logic from CallWebhookJobsJob
  async findByWorkspaceIdAndOperationPatterns(
    workspaceId: string,
    nameSingular: string,
    operation: string,
  ): Promise<Webhook[]> {
    const webhooks = await this.webhookRepository.find({
      where: { workspaceId },
    });

    // Same exact filtering logic as the original ArrayContains queries
    return webhooks.filter((webhook) =>
      webhook.operations.some(
        (op) =>
          op === `${nameSingular}.${operation}` ||
          op === `*.${operation}` ||
          op === `${nameSingular}.*` ||
          op === '*.*',
      ),
    );
  }

  async findById(id: string, workspaceId: string): Promise<Webhook | null> {
    const webhook = await this.webhookRepository.findOne({
      where: { id, workspaceId },
    });

    return webhook || null;
  }

  async create(webhookData: Partial<Webhook>): Promise<Webhook> {
    const normalizedTargetUrl = this.normalizeTargetUrl(
      webhookData.targetUrl || '',
    );

    if (!this.validateTargetUrl(normalizedTargetUrl)) {
      throw new Error('Invalid target URL provided');
    }

    const webhook = this.webhookRepository.create({
      ...webhookData,
      targetUrl: normalizedTargetUrl,
      secret: this.generateSecret(),
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
        throw new Error('Invalid target URL provided');
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
