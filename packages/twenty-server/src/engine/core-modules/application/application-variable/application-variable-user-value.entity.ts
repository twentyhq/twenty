import {
  Check,
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

import { ADD_APPLICATION_VARIABLE_USER_VALUE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-44/add-application-variable-user-value-upgrade-command-name.constant';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

@Entity({ name: 'applicationVariableUserValue', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_APPLICATION_VARIABLE_USER_VALUE_UPGRADE_COMMAND_NAME,
})
@Unique('IDX_APPLICATION_VARIABLE_USER_VALUE_VARIABLE_USER_UNIQUE', [
  'applicationVariableId',
  'userWorkspaceId',
])
@Index('IDX_APPLICATION_VARIABLE_USER_VALUE_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_APPLICATION_VARIABLE_USER_VALUE_USER_WORKSPACE_ID', [
  'userWorkspaceId',
])
@Check(
  'CHK_applicationVariableUserValue_value_encrypted',
  `"value" LIKE 'enc:v2:%'`,
)
export class ApplicationVariableUserValueEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  applicationVariableId: string;

  @ManyToOne(() => ApplicationVariableEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationVariableId' })
  applicationVariable: Relation<ApplicationVariableEntity>;

  @Column({ nullable: false, type: 'uuid' })
  userWorkspaceId: string;

  @ManyToOne(() => UserWorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: Relation<UserWorkspaceEntity>;

  @Column({ nullable: false, type: 'text' })
  value: EncryptedString;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
