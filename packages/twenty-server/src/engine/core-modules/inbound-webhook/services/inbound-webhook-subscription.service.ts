import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LessThan, Repository } from 'typeorm';

import { InboundWebhookSubscriptionEntity } from 'src/engine/core-modules/inbound-webhook/entities/inbound-webhook-subscription.entity';
import { type InboundWebhookSource } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-source.type';

@Injectable()
export class InboundWebhookSubscriptionService {
  constructor(
    @InjectRepository(InboundWebhookSubscriptionEntity, 'core')
    private readonly subscriptionRepository: Repository<InboundWebhookSubscriptionEntity>,
  ) {}

  async findById(id: string): Promise<InboundWebhookSubscriptionEntity | null> {
    return this.subscriptionRepository.findOne({ where: { id } });
  }

  async findByExternalSubscriptionId({
    source,
    externalSubscriptionId,
  }: {
    source: InboundWebhookSource;
    externalSubscriptionId: string;
  }): Promise<InboundWebhookSubscriptionEntity | null> {
    return this.subscriptionRepository.findOne({
      where: { source, externalSubscriptionId },
    });
  }

  async findExpiringBefore(
    threshold: Date,
  ): Promise<InboundWebhookSubscriptionEntity[]> {
    return this.subscriptionRepository.find({
      where: { expiresAt: LessThan(threshold) },
    });
  }

  async markNotified(id: string): Promise<void> {
    await this.subscriptionRepository.update(id, {
      lastNotificationAt: new Date(),
    });
  }

  async updateExpiry({
    id,
    expiresAt,
    externalSubscriptionId,
    externalResourceId,
  }: {
    id: string;
    expiresAt: Date | null;
    externalSubscriptionId?: string | null;
    externalResourceId?: string | null;
  }): Promise<void> {
    await this.subscriptionRepository.update(id, {
      expiresAt,
      ...(externalSubscriptionId !== undefined && { externalSubscriptionId }),
      ...(externalResourceId !== undefined && { externalResourceId }),
    });
  }
}
