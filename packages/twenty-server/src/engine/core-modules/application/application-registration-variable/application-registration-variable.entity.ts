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

import { FieldMetadataType } from 'twenty-shared/types';
import {
  type ApplicationVariableOption,
  type ApplicationVariableType,
} from 'twenty-shared/application';

import { ADD_IS_DEPRECATED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-31/add-is-deprecated-to-application-variables-upgrade-command-name.constant';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';

@Entity({ name: 'applicationRegistrationVariable', schema: 'core' })
@Unique('IDX_APP_REG_VAR_KEY_APP_REGISTRATION_ID_UNIQUE', [
  'key',
  'applicationRegistrationId',
])
@Index('IDX_APP_REG_VAR_APP_REGISTRATION_ID', ['applicationRegistrationId'])
// Registration variables are instance-scoped so the envelope's HKDF info
// does not include a workspaceId. An empty value is stored as the envelope
// of the empty string, never as ''.
@Check(
  'CHK_applicationRegistrationVariable_encryptedValue_encrypted',
  `"encryptedValue" LIKE 'enc:v2:%'`,
)
@Check(
  'CHK_applicationRegistrationVariable_deprecated_not_required',
  `NOT ("isRequired" AND "isDeprecated")`,
)
export class ApplicationRegistrationVariableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'text' })
  encryptedValue: EncryptedString;

  @Column({ nullable: false, type: 'text', default: '' })
  description: string;

  @Column({ nullable: false, type: 'boolean', default: true })
  isSecret: boolean;

  @Column({ nullable: false, type: 'boolean', default: false })
  isRequired: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_IS_DEPRECATED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, type: 'boolean', default: false })
  isDeprecated: boolean;

  @Column({ nullable: false, type: 'text', default: FieldMetadataType.TEXT })
  type: ApplicationVariableType;

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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
