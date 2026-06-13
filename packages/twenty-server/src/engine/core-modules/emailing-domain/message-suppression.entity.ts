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

// Two partial indexes because Postgres treats NULLs as distinct: one global
// block per (workspace, address), one opt-out per (workspace, address, topic).
// NOT decorated with @WasIntroducedInUpgrade: a missing-table error that fails
// sends is safer than silently skipping suppression during a deploy window.
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

  @Column({ type: 'uuid', nullable: true })
  unsubscribeTopicId: string | null;
}
