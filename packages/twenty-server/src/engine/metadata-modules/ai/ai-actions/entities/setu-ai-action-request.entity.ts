import {
  type SetuAiActionKind,
  type SetuAiActionReceipt,
  type SetuAiActionStatus,
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
import { type SetuAiActionPreconditions } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-preconditions.type';
import { type SetuAiActionStoredPayload } from 'src/engine/metadata-modules/ai/ai-actions/types/setu-ai-action-stored-payload.type';
import { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// One row is one immutable payload revision. Editing creates a new row under
// the same logical action; an approved payload is never overwritten. Chat
// threads are referenced by id only, because history lives in workspace
// objects rather than in a core table.
@Entity({ name: 'setuAiActionRequest', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_SETU_AI_ACTION_TABLES_UPGRADE_COMMAND_NAME,
})
@Index(
  'IDX_SETU_AI_ACTION_REQUEST_DEDUPLICATION_KEY',
  ['workspaceId', 'deduplicationKey'],
  {
    unique: true,
  },
)
@Index(
  'IDX_SETU_AI_ACTION_REQUEST_LOGICAL_REVISION',
  ['logicalActionId', 'revision'],
  {
    unique: true,
  },
)
@Index('IDX_SETU_AI_ACTION_REQUEST_ONE_OPEN_REVISION', ['logicalActionId'], {
  unique: true,
  where: `"status" IN ('pending_review', 'queued', 'running', 'delivery_unknown')`,
})
@Index('IDX_SETU_AI_ACTION_REQUEST_STATUS', ['status', 'leaseExpiresAt'])
@Index('IDX_SETU_AI_ACTION_REQUEST_THREAD', ['workspaceId', 'threadId'])
export class SetuAiActionRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ nullable: true, type: 'uuid' })
  threadId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  taskId: string | null;

  @Column({ nullable: false, type: 'uuid' })
  initiatorUserWorkspaceId: string;

  @Column({ nullable: false, type: 'uuid' })
  logicalActionId: string;

  @Column({ nullable: false, type: 'integer' })
  revision: number;

  @Column({ nullable: false, type: 'varchar' })
  kind: SetuAiActionKind;

  @Column({ nullable: false, type: 'jsonb' })
  payload: JsonbProperty<SetuAiActionStoredPayload>;

  @Column({ nullable: false, type: 'varchar' })
  payloadHash: string;

  @Column({ nullable: false, type: 'jsonb', default: {} })
  preconditions: JsonbProperty<SetuAiActionPreconditions>;

  @Column({ nullable: false, type: 'varchar' })
  status: SetuAiActionStatus;

  @Column({ nullable: false, type: 'integer', default: 1 })
  stateVersion: number;

  @Column({ nullable: false, type: 'varchar' })
  deduplicationKey: string;

  @Column({ nullable: false, type: 'integer' })
  policyVersion: number;

  @Column({ nullable: true, type: 'timestamptz' })
  expiresAt: Date | null;

  @Column({ nullable: true, type: 'uuid' })
  decidedByUserWorkspaceId: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  decidedAt: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  decisionRequestId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  leaseOwner: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  leaseExpiresAt: Date | null;

  @Column({ nullable: false, type: 'integer', default: 0 })
  fencingToken: number;

  @Column({ nullable: true, type: 'varchar' })
  errorCode: SetuAiErrorCode | null;

  @Column({ nullable: true, type: 'jsonb' })
  receipt: JsonbProperty<SetuAiActionReceipt> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
