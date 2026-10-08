import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';

import { CREATE_PENDING_WAKE_UP_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/create-pending-wake-up-table-upgrade-command-name.constant';
import { ADD_PAYLOAD_TO_PENDING_WAKE_UP_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/add-payload-to-pending-wake-up-upgrade-command-name.constant';
import { type PendingWakeUpOwnerType } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-type.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

// Waits resolved by time, a record event or an answer, so they survive a lost queue job or a restart.
// Deleting the row is how a resolution claims it, so a wake-up resolves once.
@Entity({ name: 'pendingWakeUp', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_PENDING_WAKE_UP_TABLE_UPGRADE_COMMAND_NAME,
})
@Unique('UQ_PENDING_WAKE_UP_OWNER', ['ownerType', 'ownerId', 'ownerKey'])
@Index('IDX_PENDING_WAKE_UP_WORKSPACE_EVENT_NAME', ['workspaceId', 'eventName'])
@Index('IDX_PENDING_WAKE_UP_RESUME_AT', ['resumeAt'])
export class PendingWakeUpEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  ownerType: PendingWakeUpOwnerType;

  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({ type: 'varchar' })
  ownerKey: string;

  @Column({ type: 'jsonb' })
  condition: PendingWakeUpCondition;

  // what the owner needs to resume, which only its handler reads
  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_PAYLOAD_TO_PENDING_WAKE_UP_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'jsonb', nullable: true })
  payload: object | null;

  @Column({ type: 'varchar', nullable: true })
  eventName: string | null;

  // When a time condition elapses or an event condition expires
  @Column({ type: 'timestamptz', nullable: true })
  resumeAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
