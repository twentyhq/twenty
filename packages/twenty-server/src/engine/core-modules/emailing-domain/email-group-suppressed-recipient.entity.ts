import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { FieldActorSource } from 'twenty-shared/types';

import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';
import { EmailGroupSuppressionScope } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-scope.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'emailGroupSuppressedRecipient', schema: 'core' })
@Unique('IDX_EMAIL_GROUP_SUPPRESSED_RECIPIENT_WS_EMAIL_SCOPE_UNIQUE', [
  'workspaceId',
  'emailAddress',
  'scope',
])
export class EmailGroupSuppressedRecipientEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  emailAddress: string;

  @Column({
    type: 'enum',
    enum: Object.values(EmailGroupSuppressionScope),
    nullable: false,
  })
  scope: EmailGroupSuppressionScope;

  @Column({
    type: 'enum',
    enum: Object.values(EmailGroupSuppressionReason),
    nullable: false,
  })
  reason: EmailGroupSuppressionReason;

  @Column({ type: 'boolean', default: true, nullable: false })
  isSuppressed: boolean;

  @Column({ type: 'varchar', nullable: true })
  providerEventId: string | null;

  @Column({
    type: 'enum',
    enum: Object.values(FieldActorSource),
    nullable: false,
  })
  createdBySource: FieldActorSource;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
