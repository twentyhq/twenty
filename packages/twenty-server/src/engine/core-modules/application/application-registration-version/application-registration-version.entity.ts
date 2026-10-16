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

import { ADD_APPLICATION_REGISTRATION_VERSIONS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-48/add-application-registration-versions-upgrade-command-name.constant';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';

@Entity({ name: 'applicationRegistrationVersion', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName:
    ADD_APPLICATION_REGISTRATION_VERSIONS_UPGRADE_COMMAND_NAME,
})
@Unique('IDX_APP_REG_VERSION_APP_REGISTRATION_ID_VERSION_UNIQUE', [
  'applicationRegistrationId',
  'version',
])
@Index('IDX_APP_REG_VERSION_TARBALL_FILE_ID', ['tarballFileId'])
@Check(
  'CHK_APP_REG_VERSION_NPM_HAS_SOURCE_PACKAGE',
  `"sourceType" <> 'npm' OR "sourcePackage" IS NOT NULL`,
)
export class ApplicationRegistrationVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  applicationRegistrationId: string;

  @ManyToOne(
    () => ApplicationRegistrationEntity,
    (applicationRegistration) => applicationRegistration.versions,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'applicationRegistrationId' })
  applicationRegistration: Relation<ApplicationRegistrationEntity>;

  @Column({ nullable: false, type: 'varchar' })
  version: string;

  @Column({ nullable: false, type: 'varchar' })
  sourceType: ApplicationRegistrationSourceType;

  @Column({ nullable: true, type: 'varchar' })
  sourcePackage: string | null;

  @Column({ nullable: true, type: 'uuid' })
  tarballFileId: string | null;

  @ManyToOne(() => FileEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'tarballFileId' })
  tarballFile: Relation<FileEntity> | null;

  @Column({ nullable: true, type: 'varchar' })
  tarballUrl: string | null;

  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  publishedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
