import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'messageCampaignLink', schema: 'core' })
@Index(
  'IDX_MESSAGE_CAMPAIGN_LINK_URL_UNIQUE',
  ['workspaceId', 'messageCampaignId', 'urlHash'],
  { unique: true },
)
@Index('IDX_MESSAGE_CAMPAIGN_LINK_CAMPAIGN_ID', [
  'workspaceId',
  'messageCampaignId',
])
export class MessageCampaignLinkEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'uuid', nullable: false })
  messageCampaignId: string;

  @Column({ type: 'text', nullable: false })
  url: string;

  @Column({ type: 'char', length: 64, nullable: false })
  urlHash: string;
}
