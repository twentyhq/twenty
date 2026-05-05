import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type InboundWebhookSource } from 'src/engine/core-modules/inbound-webhook/types/inbound-webhook-source.type';

@Index('IDX_INBOUND_WEBHOOK_SUBSCRIPTION_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_INBOUND_WEBHOOK_SUBSCRIPTION_SOURCE', ['source'])
@Index('IDX_INBOUND_WEBHOOK_SUBSCRIPTION_EXTERNAL_ID', [
  'externalSubscriptionId',
])
@Index('IDX_INBOUND_WEBHOOK_SUBSCRIPTION_EXPIRES_AT', ['expiresAt'])
@Entity({ name: 'inboundWebhookSubscription', schema: 'core' })
export class InboundWebhookSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'varchar' })
  source: InboundWebhookSource;

  @Column({ type: 'uuid', nullable: true })
  connectedAccountId: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalSubscriptionId: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalResourceId: string | null;

  @Column({ type: 'varchar' })
  secret: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastNotificationAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
