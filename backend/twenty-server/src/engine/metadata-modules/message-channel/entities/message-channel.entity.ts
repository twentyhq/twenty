import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'messageChannel', schema: 'core' })
export class MessageChannelEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MessageChannelVisibility,
    nullable: false,
  })
  visibility: MessageChannelVisibility;

  @Column({ type: 'varchar', nullable: false })
  handle: string;

  @Column({
    type: 'enum',
    enum: MessageChannelType,
    nullable: false,
  })
  type: MessageChannelType;

  @Column({ type: 'boolean', nullable: false, default: true })
  isContactAutoCreationEnabled: boolean;

  @Column({
    type: 'enum',
    enum: MessageChannelContactAutoCreationPolicy,
    nullable: false,
    default: MessageChannelContactAutoCreationPolicy.SENT,
  })
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;

  @Column({
    type: 'enum',
    enum: MessageFolderImportPolicy,
    nullable: false,
    default: MessageFolderImportPolicy.ALL_FOLDERS,
  })
  messageFolderImportPolicy: MessageFolderImportPolicy;

  @Column({ type: 'boolean', nullable: false, default: true })
  excludeNonProfessionalEmails: boolean;

  @Column({ type: 'boolean', nullable: false, default: true })
  excludeGroupEmails: boolean;

  @Column({
    type: 'enum',
    enum: MessageChannelPendingGroupEmailsAction,
    nullable: false,
  })
  pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction;

  @Column({ type: 'boolean', nullable: false, default: true })
  isSyncEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  syncCursor: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  syncedAt: Date | null;

  @Column({
    type: 'enum',
    enum: MessageChannelSyncStatus,
    nullable: false,
    default: MessageChannelSyncStatus.NOT_SYNCED,
  })
  syncStatus: MessageChannelSyncStatus;

  @Column({
    type: 'enum',
    enum: MessageChannelSyncStage,
    nullable: false,
  })
  syncStage: MessageChannelSyncStage;

  @Column({ type: 'timestamptz', nullable: true })
  syncStageStartedAt: Date | null;

  @Column({ type: 'integer', nullable: false, default: 0 })
  throttleFailureCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  throttleRetryAfter: Date | null;

  @Column({ type: 'uuid', nullable: false })
  connectedAccountId: string;

  @ManyToOne(
    () => ConnectedAccountEntity,
    (connectedAccount) => connectedAccount.messageChannels,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'connectedAccountId' })
  connectedAccount: Relation<ConnectedAccountEntity>;

  @OneToMany(
    'MessageFolderEntity',
    (messageFolder: MessageFolderEntity) => messageFolder.messageChannel,
  )
  messageFolders: Relation<MessageFolderEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
