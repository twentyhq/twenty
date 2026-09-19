import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { ADD_AGENT_CHAT_CHANNELS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-channels-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel.entity';
import { AgentChatChannelMemberRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-member-role.enum';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_AGENT_CHAT_CHANNELS_UPGRADE_COMMAND_NAME,
})
@Entity({ name: 'agentChatChannelMember', schema: 'core' })
@Index(
  'IDX_AGENT_CHAT_CHANNEL_MEMBER_CHANNEL_USER_WORKSPACE_UNIQUE',
  ['channelId', 'userWorkspaceId'],
  { unique: true },
)
export class AgentChatChannelMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_CHANNEL_MEMBER_WORKSPACE_ID')
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  channelId: string;

  @ManyToOne(() => AgentChatChannelEntity, (channel) => channel.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channelId' })
  channel: Relation<AgentChatChannelEntity>;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_CHANNEL_MEMBER_USER_WORKSPACE_ID')
  userWorkspaceId: string;

  @ManyToOne(() => UserWorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: EntityRelation<UserWorkspaceEntity>;

  @Column({ type: 'varchar', default: AgentChatChannelMemberRole.MEMBER })
  role: AgentChatChannelMemberRole;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
