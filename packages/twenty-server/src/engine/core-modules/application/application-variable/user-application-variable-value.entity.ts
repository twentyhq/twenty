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

import {
  APPLICATION_VARIABLE_SCOPES,
  type ApplicationVariableScope,
} from 'twenty-shared/application';

import { ADD_USER_APPLICATION_VARIABLE_VALUE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/add-user-application-variable-value-upgrade-command-name.constant';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

@Entity({ name: 'userApplicationVariableValue', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_USER_APPLICATION_VARIABLE_VALUE_UPGRADE_COMMAND_NAME,
})
@Unique('IDX_USER_APPLICATION_VARIABLE_VALUE_VARIABLE_USER_UNIQUE', [
  'applicationVariableId',
  'userWorkspaceId',
])
@Index('IDX_USER_APPLICATION_VARIABLE_VALUE_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_USER_APPLICATION_VARIABLE_VALUE_USER_WORKSPACE_ID', [
  'userWorkspaceId',
])
@Check(
  'CHK_userApplicationVariableValue_value_encrypted',
  `"value" LIKE 'enc:v2:%'`,
)
@Check('CHK_userApplicationVariableValue_scope_user', `"scope" = 'USER'`)
export class UserApplicationVariableValueEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  applicationVariableId: string;

  // Always USER: the foreign key on (applicationVariableId, scope) then lets
  // the database refuse a member value on a WORKSPACE variable.
  @Column({
    nullable: false,
    type: 'enum',
    enum: APPLICATION_VARIABLE_SCOPES,
    enumName: 'applicationVariable_scope_enum',
    default: 'USER',
  })
  scope: ApplicationVariableScope;

  @ManyToOne(() => ApplicationVariableEntity, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'applicationVariableId', referencedColumnName: 'id' },
    { name: 'scope', referencedColumnName: 'scope' },
  ])
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
