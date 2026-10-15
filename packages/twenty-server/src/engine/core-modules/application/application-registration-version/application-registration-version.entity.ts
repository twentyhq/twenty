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

import { ADD_APPLICATION_REGISTRATION_VERSIONS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-48/add-application-registration-versions-upgrade-command-name.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationRegistrationVersionReviewState } from 'src/engine/core-modules/application/application-registration-version/enums/application-registration-version-review-state.enum';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'applicationRegistrationVersion', schema: 'core' })
@ObjectType('ApplicationRegistrationVersion')
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
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => UUIDScalarType)
  @Column({ nullable: false, type: 'uuid' })
  applicationRegistrationId: string;

  @ManyToOne(
    () => ApplicationRegistrationEntity,
    (applicationRegistration) => applicationRegistration.versions,
    { onDelete: 'CASCADE', nullable: false },
  )
  @JoinColumn({ name: 'applicationRegistrationId' })
  applicationRegistration: Relation<ApplicationRegistrationEntity>;

  @Field()
  @Column({ nullable: false, type: 'text' })
  version: string;

  @Field(() => ApplicationRegistrationSourceType)
  @Column({ nullable: false, type: 'text' })
  sourceType: ApplicationRegistrationSourceType;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  sourcePackage: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @Column({ nullable: true, type: 'uuid' })
  tarballFileId: string | null;

  @ManyToOne(() => FileEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'tarballFileId' })
  tarballFile: Relation<FileEntity> | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  tarballUrl: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  checksum: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @Column({ nullable: true, type: 'uuid' })
  publishedByUserId: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'publishedByUserId' })
  publishedByUser: Relation<UserEntity> | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @Column({ nullable: true, type: 'uuid' })
  publishedByWorkspaceId: string | null;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'publishedByWorkspaceId' })
  publishedByWorkspace: Relation<WorkspaceEntity> | null;

  @Field()
  @Column({ type: 'timestamptz', nullable: false, default: () => 'now()' })
  publishedAt: Date;

  @Field(() => ApplicationRegistrationVersionReviewState)
  @Column({
    type: 'text',
    nullable: false,
    default: ApplicationRegistrationVersionReviewState.UNREVIEWED,
  })
  reviewState: ApplicationRegistrationVersionReviewState;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
