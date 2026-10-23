import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_AGENT_CHAT_CHANNEL_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-51/add-agent-chat-channel-upgrade-command-name.constant';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'agentChatChannel', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_AGENT_CHAT_CHANNEL_UPGRADE_COMMAND_NAME,
})
@Index('IDX_AGENT_CHAT_CHANNEL_WORKSPACE_ID_APPLICATION_ID', [
  'workspaceId',
  'applicationId',
])
@Index(
  'IDX_AGENT_CHAT_CHANNEL_NAME_WORKSPACE_ID_UNIQUE',
  ['name', 'workspaceId'],
  {
    unique: true,
  },
)
export class AgentChatChannelEntity
  extends SyncableEntity
  implements Required<AgentChatChannelEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: true, type: 'varchar' })
  color: string | null;

  @Column({ nullable: false, type: 'float', default: 0 })
  position: number;

  @Column({ nullable: false, default: false })
  isCustom: boolean;

  @OneToMany(
    () => AgentChatChannelRoleEntity,
    (channelRole: AgentChatChannelRoleEntity) => channelRole.channel,
  )
  channelRoles: Relation<AgentChatChannelRoleEntity[]>;

  @OneToMany(
    () => NavigationMenuItemEntity,
    (navigationMenuItem: NavigationMenuItemEntity) =>
      navigationMenuItem.agentChatChannel,
  )
  navigationMenuItems: Relation<NavigationMenuItemEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
