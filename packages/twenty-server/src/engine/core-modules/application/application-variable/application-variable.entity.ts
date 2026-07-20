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
@Check(
  'CHK_applicationVariable_value_encrypted',
  `"value" = '' OR "value" LIKE 'enc:v2:%'`,
)
export class ApplicationVariableEntity extends SyncableEntity {
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'text', default: '' })
  value: EncryptedString | '';

  @Column({ nullable: false, type: 'text', default: '' })
  description: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  isSecret: boolean;

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
