import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { MessageCampaignLinkEntity } from 'src/engine/core-modules/emailing-domain/message-campaign-link.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'messageCampaignLinkClick', schema: 'core' })
@Index(
  'IDX_MESSAGE_CAMPAIGN_LINK_CLICK_RECIPIENT_UNIQUE',
  ['messageCampaignLinkId', 'messageId'],
  { unique: true },
)
@Index('IDX_MESSAGE_CAMPAIGN_LINK_CLICK_MESSAGE_ID', [
  'workspaceId',
  'messageId',
])
export class MessageCampaignLinkClickEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: false })
  messageCampaignLinkId: string;

  @ManyToOne(() => MessageCampaignLinkEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageCampaignLinkId' })
  messageCampaignLink: Relation<MessageCampaignLinkEntity>;

  @Column({ type: 'uuid', nullable: false })
  messageId: string;

  @Column({ type: 'integer', nullable: false, default: 1 })
  clickCount: number;

  @Column({ type: 'timestamptz', nullable: false })
  lastClickedAt: Date;
}
