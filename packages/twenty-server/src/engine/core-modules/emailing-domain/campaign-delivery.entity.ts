import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type CampaignFailureReason } from 'src/engine/core-modules/emailing-domain/types/campaign-failure-reason.type';
import { type CampaignDeliveryState } from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-state.type';
import { type CampaignSkipReason } from 'src/engine/core-modules/emailing-domain/types/campaign-skip-reason.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'campaignDelivery', schema: 'core' })
@Check(
  'CHK_CAMPAIGN_DELIVERY_CLAIM_HAS_LEASE',
  `"state" <> 'SENDING' OR "claimExpiresAt" IS NOT NULL`,
)
@Index('IDX_CAMPAIGN_DELIVERY_UNIQUE', ['campaignId', 'personId'], {
  unique: true,
})
@Index('IDX_CAMPAIGN_DELIVERY_UNFINISHED', ['campaignId'], {
  where: `"state" IN ('QUEUED', 'SENDING')`,
})
@Index('IDX_CAMPAIGN_DELIVERY_EXPIRED_CLAIM', ['claimExpiresAt'], {
  where: `"state" = 'SENDING'`,
})
@Index('IDX_CAMPAIGN_DELIVERY_COUNTS', ['workspaceId', 'campaignId', 'state'])
@Index(
  'IDX_CAMPAIGN_DELIVERY_PROVIDER_MESSAGE_ID',
  ['workspaceId', 'providerMessageId'],
  { unique: true, where: '"providerMessageId" IS NOT NULL' },
)
export class CampaignDeliveryEntity extends WorkspaceRelatedEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: false })
  campaignId: string;

  @Column({ type: 'uuid', nullable: false })
  messageId: string;

  @Column({ type: 'uuid', nullable: true })
  personId: string | null;

  @Column({ type: 'varchar', nullable: false })
  recipientEmail: string;

  @Column({ type: 'varchar', nullable: false, default: 'QUEUED' })
  state: CampaignDeliveryState;

  @Column({ type: 'varchar', nullable: true })
  skipReason: CampaignSkipReason | null;

  @Column({ type: 'varchar', nullable: true })
  failureReason: CampaignFailureReason | null;

  @Column({ type: 'uuid', nullable: true })
  claimToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  claimExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  providerMessageId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  bouncedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  complainedAt: Date | null;
}
