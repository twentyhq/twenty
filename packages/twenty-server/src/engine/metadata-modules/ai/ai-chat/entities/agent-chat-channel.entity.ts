import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_AGENT_CHAT_CHANNELS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-channels-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentChatChannelMemberEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel-member.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_AGENT_CHAT_CHANNELS_UPGRADE_COMMAND_NAME,
})
@Entity({ name: 'agentChatChannel', schema: 'core' })
@Index(
  'IDX_AGENT_CHAT_CHANNEL_WORKSPACE_ID_NAME_UNIQUE',
  ['workspaceId', 'name'],
  {
    unique: true,
  },
)
export class AgentChatChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_CHANNEL_WORKSPACE_ID')
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', default: AgentChatChannelVisibility.PUBLIC })
  visibility: AgentChatChannelVisibility;

  // A channel can be anchored to a CRM record (a deal room on an opportunity,
  // an account channel on a company). Both stay null for a free-form channel.
  @Column({ type: 'uuid', nullable: true })
  targetObjectMetadataId: string | null;

  @Column({ type: 'uuid', nullable: true })
  targetRecordId: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserWorkspaceId: string | null;

  @ManyToOne(() => UserWorkspaceEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'createdByUserWorkspaceId' })
  createdByUserWorkspace: EntityRelation<UserWorkspaceEntity> | null;

  @OneToMany(() => AgentChatChannelMemberEntity, (member) => member.channel)
  members: EntityRelation<AgentChatChannelMemberEntity[]>;

  @OneToMany(() => AgentChatThreadEntity, (thread) => thread.channel)
  threads: Relation<AgentChatThreadEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
