import { Field, ObjectType } from '@nestjs/graphql';
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

import { GraphQLJSON } from 'graphql-type-json';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  type ApplicationVariableOption,
  type ApplicationVariableType,
} from 'twenty-shared/application';

import { ADD_IS_DEPRECATED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-30/add-is-deprecated-to-application-variables-upgrade-command-name.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';

@Entity({ name: 'applicationRegistrationVariable', schema: 'core' })
@ObjectType('ApplicationRegistrationVariable')
@Unique('IDX_APP_REG_VAR_KEY_APP_REGISTRATION_ID_UNIQUE', [
  'key',
  'applicationRegistrationId',
])
@Index('IDX_APP_REG_VAR_APP_REGISTRATION_ID', ['applicationRegistrationId'])
// Constrains `encryptedValue` to the unfilled default ('') or to the
// versioned envelope. Registration variables are instance-scoped so the
// envelope's HKDF info does not include a workspaceId.
@Check(
  'CHK_applicationRegistrationVariable_encryptedValue_encrypted',
  `"encryptedValue" = '' OR "encryptedValue" LIKE 'enc:v2:%'`,
)
@Check(
  'CHK_applicationRegistrationVariable_deprecated_not_required',
  `NOT ("isRequired" AND "isDeprecated")`,
)
export class ApplicationRegistrationVariableEntity {
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'text', default: '' })
  encryptedValue: EncryptedString | '';

  @Field()
  @Column({ nullable: false, type: 'text', default: '' })
  description: string;

  @Field()
  @Column({ nullable: false, type: 'boolean', default: true })
  isSecret: boolean;

  @Field()
  @Column({ nullable: false, type: 'boolean', default: false })
  isRequired: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_IS_DEPRECATED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME,
  })
  @Field()
  @Column({ nullable: false, type: 'boolean', default: false })
  isDeprecated: boolean;

  @Field(() => String)
  @Column({ nullable: false, type: 'text', default: FieldMetadataType.TEXT })
  type: ApplicationVariableType;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ nullable: true, type: 'jsonb', default: null })
  options: ApplicationVariableOption[] | null;

  @Column({ nullable: false, type: 'uuid' })
  applicationRegistrationId: string;

  @ManyToOne(
    () => ApplicationRegistrationEntity,
    (applicationRegistration) => applicationRegistration.variables,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'applicationRegistrationId' })
  applicationRegistration: Relation<ApplicationRegistrationEntity>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
