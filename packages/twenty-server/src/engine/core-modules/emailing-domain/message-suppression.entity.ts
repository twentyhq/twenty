import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// Compliance state, not CRM data: which addresses must not be emailed (global
// block when unsubscribeTopicId is NULL, per-topic opt-out otherwise). Written only by
// webhook handlers and the public unsubscribe controller — both run outside any
// workspace/user context — so it lives in core, like emailingDomain.
//
// Uniqueness is split into two partial indexes because Postgres treats NULLs as
// distinct: one global block per (workspace, address), one opt-out per
// (workspace, address, topic). The plain workspaceId index serves the workspace
// ON DELETE CASCADE, which neither partial index can.
//
// Deliberately NOT decorated with @WasIntroducedInUpgrade: its degraded mode
// (reads return empty) would silently disable suppression filtering and mail
// opted-out recipients during a deploy window; a loud relation-missing error
// that fails sends until the migration runs is the safer failure for this table.
@Entity({ name: 'messageSuppression', schema: 'core' })
@Index(
  'IDX_MESSAGE_SUPPRESSION_GLOBAL_UNIQUE',
  ['workspaceId', 'emailAddress'],
  {
    unique: true,
    where: '"unsubscribeTopicId" IS NULL',
  },
)
@Index(
  'IDX_MESSAGE_SUPPRESSION_TOPIC_UNIQUE',
  ['workspaceId', 'emailAddress', 'unsubscribeTopicId'],
  { unique: true, where: '"unsubscribeTopicId" IS NOT NULL' },
)
@Index('IDX_MESSAGE_SUPPRESSION_WORKSPACE_ID', ['workspaceId'])
export class MessageSuppressionEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Normalized (trimmed, lowercased) by the service before any read or write.
  @Column({ type: 'varchar', nullable: false })
  emailAddress: string;

  @Column({
    type: 'enum',
    enum: Object.values(MessageSuppressionReason),
    nullable: false,
  })
  reason: MessageSuppressionReason;

  @Column({
    type: 'enum',
    enum: Object.values(MessageSuppressionSource),
    nullable: false,
  })
  source: MessageSuppressionSource;

  @Column({ type: 'varchar', nullable: true })
  providerEventId: string | null;

  // References core.unsubscribeTopic by id (a plain column, not a modelled relation,
  // so the schema matches TypeORM's entity model). Rows can outlive their topic —
  // orphaned per-topic opt-outs are inert, since every read intersects live
  // topics. NULL means a global block (every send), not a per-topic opt-out.
  @Column({ type: 'uuid', nullable: true })
  unsubscribeTopicId: string | null;
}
