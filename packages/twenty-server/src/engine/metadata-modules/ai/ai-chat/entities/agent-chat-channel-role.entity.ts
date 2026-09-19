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

import { ADD_AGENT_CHAT_CHANNEL_ROLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-channel-roles-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// Everyone holding one of a channel's roles reads the channel like a member,
// without a member row of their own.
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_AGENT_CHAT_CHANNEL_ROLES_UPGRADE_COMMAND_NAME,
})
@Entity({ name: 'agentChatChannelRole', schema: 'core' })
@Index(
  'IDX_AGENT_CHAT_CHANNEL_ROLE_CHANNEL_ID_ROLE_ID_UNIQUE',
  ['channelId', 'roleId'],
  { unique: true },
)
export class AgentChatChannelRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_CHANNEL_ROLE_WORKSPACE_ID')
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  channelId: string;

  @ManyToOne(() => AgentChatChannelEntity, (channel) => channel.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'channelId' })
  channel: Relation<AgentChatChannelEntity>;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_CHANNEL_ROLE_ROLE_ID')
  roleId: string;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
