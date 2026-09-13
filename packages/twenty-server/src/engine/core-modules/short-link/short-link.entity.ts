import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'shortLink', schema: 'core' })
@Index(
  'IDX_SHORT_LINK_URL_UNIQUE',
  ['workspaceId', 'messageCampaignId', 'urlHash'],
  { unique: true },
)
@Index('IDX_SHORT_LINK_MESSAGE_CAMPAIGN_ID', [
  'workspaceId',
  'messageCampaignId',
])
export class ShortLinkEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'uuid', nullable: false })
  messageCampaignId: string;

  @Column({ type: 'varchar', nullable: false })
  authoredUrl: string;

  @Column({ type: 'varchar', nullable: false })
  url: string;

  @Column({ type: 'char', length: 64, nullable: false })
  urlHash: string;
}
