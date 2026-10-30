import {
  type SetuAiActionReceipt,
  type SetuAiErrorCode,
} from 'twenty-shared/ai';
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

import { ADD_SETU_AI_ACTION_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-44/add-setu-ai-action-tables-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SetuAiActionRequestEntity } from 'src/engine/metadata-modules/ai/ai-actions/entities/setu-ai-action-request.entity';
import { type SetuAiActionAttemptOutcome } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-attempt-outcome.type';
import { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// Written before an external call starts, so a crash after the provider
// accepted a send leaves a started attempt behind instead of a clean slate
// that would invite a second send.
@Entity({ name: 'setuAiActionAttempt', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_SETU_AI_ACTION_TABLES_UPGRADE_COMMAND_NAME,
})
@Index(
  'IDX_SETU_AI_ACTION_ATTEMPT_ACTION_NUMBER',
  ['actionRequestId', 'attemptNumber'],
  {
    unique: true,
  },
)
export class SetuAiActionAttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  actionRequestId: string;

  @ManyToOne(() => SetuAiActionRequestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'actionRequestId' })
  actionRequest: Relation<SetuAiActionRequestEntity>;

  @Column({ nullable: false, type: 'integer' })
  attemptNumber: number;

  @Column({ nullable: false, type: 'integer' })
  fencingToken: number;

  @Column({ nullable: false, type: 'varchar' })
  outcome: SetuAiActionAttemptOutcome;

  @Column({ nullable: true, type: 'varchar' })
  errorCode: SetuAiErrorCode | null;

  @Column({ nullable: true, type: 'varchar' })
  providerCorrelationId: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  sanitizedResult: JsonbProperty<SetuAiActionReceipt> | null;

  @Column({ nullable: true, type: 'timestamptz' })
  finishedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  startedAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
