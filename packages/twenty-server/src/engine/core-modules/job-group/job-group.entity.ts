import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_JOB_GROUPS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-60/add-job-groups-upgrade-command-name.constant';
import { type MessageQueueLimiter } from 'src/engine/core-modules/message-queue/types/message-queue-limiter.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

@Unique('UQ_JOB_GROUP_WORKSPACE_ID_KEY', ['workspaceId', 'key'])
@Entity({ name: 'jobGroup', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_JOB_GROUPS_UPGRADE_COMMAND_NAME,
})
export class JobGroupEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  key: string;

  @Column({ type: 'jsonb', nullable: true })
  limiter: MessageQueueLimiter | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
