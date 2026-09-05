import { Field, ObjectType } from '@nestjs/graphql';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import {
  type ApplicationVariableOption,
  type ApplicationVariableType,
} from 'twenty-shared/application';

import { ADD_TYPE_AND_OPTIONS_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-19/add-type-and-options-to-application-variables-upgrade-command-name.constant';
import { ADD_IS_DEPRECATED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-31/add-is-deprecated-to-application-variables-upgrade-command-name.constant';
import { ADD_LABEL_TO_APPLICATION_VARIABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-36/add-label-to-application-variable-upgrade-command-name.constant';
import { ADD_IS_REQUIRED_TO_APPLICATION_VARIABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-39/add-is-required-to-application-variable-upgrade-command-name.constant';
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
export class ApplicationVariableEntity extends SyncableEntity {
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'text' })
  value: EncryptedString;

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

  /**
   * A required variable with no value means the application is not usable in this workspace.
   * Server variables have carried this flag since they existed; workspace variables did not, so
   * the very values an installation must capture per workspace — the ones an app cannot ship a
   * default for — were the only ones nothing could flag as missing.
   */
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_IS_REQUIRED_TO_APPLICATION_VARIABLE_UPGRADE_COMMAND_NAME,
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
