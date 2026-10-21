import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_AGENT_CHAT_CHANNEL_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-51/add-agent-chat-channel-upgrade-command-name.constant';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'agentChatChannelRole', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_AGENT_CHAT_CHANNEL_UPGRADE_COMMAND_NAME,
})
@Unique('IDX_AGENT_CHAT_CHANNEL_ROLE_CHANNEL_ID_ROLE_ID_UNIQUE', [
  'channelId',
  'roleId',
])
@Index('IDX_AGENT_CHAT_CHANNEL_ROLE_WORKSPACE_ID_ROLE_ID', [
  'workspaceId',
  'roleId',
])
export class AgentChatChannelRoleEntity
  extends SyncableEntity
  implements Required<AgentChatChannelRoleEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  channelId: string;

  @ManyToOne(
    () => AgentChatChannelEntity,
    (channel: AgentChatChannelEntity) => channel.channelRoles,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'channelId' })
  channel: Relation<AgentChatChannelEntity>;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(
    () => RoleEntity,
    (role: RoleEntity) => role.agentChatChannelRoles,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
