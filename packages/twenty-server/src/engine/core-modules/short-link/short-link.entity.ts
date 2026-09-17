import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ADD_SHORT_LINK_AND_MESSAGE_TRACKING_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-short-link-and-message-tracking-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'shortLink', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_SHORT_LINK_AND_MESSAGE_TRACKING_UPGRADE_COMMAND_NAME,
})
@Index('IDX_SHORT_LINK_URL_UNIQUE', ['workspaceId', 'urlHash'], {
  unique: true,
})
export class ShortLinkEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: false })
  authoredUrl: string;

  @Column({ type: 'varchar', nullable: false })
  url: string;

  @Column({ type: 'char', length: 64, nullable: false })
  urlHash: string;
}
