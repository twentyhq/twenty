import { Field, ObjectType } from '@nestjs/graphql';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import {
  APPLICATION_VARIABLE_SCOPES,
  DEFAULT_APPLICATION_VARIABLE_SCOPE,
  type ApplicationVariableOption,
  type ApplicationVariableScope,
  type ApplicationVariableType,
} from 'twenty-shared/application';

import { ADD_TYPE_AND_OPTIONS_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-19/add-type-and-options-to-application-variables-upgrade-command-name.constant';
import { ADD_IS_DEPRECATED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-31/add-is-deprecated-to-application-variables-upgrade-command-name.constant';
import { ADD_LABEL_TO_APPLICATION_VARIABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-36/add-label-to-application-variable-upgrade-command-name.constant';
import { ADD_IS_REQUIRED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-is-required-to-application-variables-upgrade-command-name.constant';
import { ADD_SCOPE_AND_DEFAULT_VALUE_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/add-scope-and-default-value-to-application-variables-upgrade-command-name.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({
  name: 'applicationVariable',
  schema: 'core',
})
@ObjectType('ApplicationVariable')
// All values are always encrypted regardless of `isSecret`. The
// `isSecret` flag only controls display behavior (masked vs plaintext).
@Check('CHK_applicationVariable_value_encrypted', `"value" LIKE 'enc:v2:%'`)
@Check(
  'CHK_applicationVariable_deprecated_not_required',
  `NOT ("isRequired" AND "isDeprecated")`,
)
@Check(
  'CHK_applicationVariable_value_null_only_for_user_scope',
  `("scope" = 'USER') = ("value" IS NULL)`,
)
@Check(
  'CHK_applicationVariable_default_value_not_secret',
  `NOT ("isSecret" AND "defaultValue" IS NOT NULL)`,
)
// Target of the member value foreign key on (applicationVariableId, scope),
// so the database only accepts member values on USER variables.
@Unique('IDX_APPLICATION_VARIABLE_ID_SCOPE_UNIQUE', ['id', 'scope'])
export class ApplicationVariableEntity extends SyncableEntity {
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: true, type: 'text' })
  value: EncryptedString | null;

  @Column({ nullable: false, type: 'text', default: '' })
  description: string;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_LABEL_TO_APPLICATION_VARIABLE_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, type: 'text', default: '' })
  label: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  isSecret: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_IS_DEPRECATED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, type: 'boolean', default: false })
  isDeprecated: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_IS_REQUIRED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, type: 'boolean', default: false })
  isRequired: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_TYPE_AND_OPTIONS_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, type: 'text', default: FieldMetadataType.TEXT })
  type: ApplicationVariableType;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_TYPE_AND_OPTIONS_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'jsonb', default: null })
  options: ApplicationVariableOption[] | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_SCOPE_AND_DEFAULT_VALUE_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME,
  })
  @Column({
    nullable: false,
    type: 'enum',
    enum: APPLICATION_VARIABLE_SCOPES,
    default: DEFAULT_APPLICATION_VARIABLE_SCOPE,
  })
  scope: ApplicationVariableScope;

  // Metadata from the manifest, never written by a member or an admin, so a
  // sync can update it. It is plaintext because secrets cannot have one.
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_SCOPE_AND_DEFAULT_VALUE_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'text' })
  defaultValue: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
