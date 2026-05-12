import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type Manifest } from 'twenty-shared/application';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'applicationRegistration', schema: 'core' })
@ObjectType('ApplicationRegistration')
@Index(
  'IDX_APPLICATION_REGISTRATION_UNIVERSAL_IDENTIFIER_UNIQUE',
  ['universalIdentifier'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
@Index(
  'IDX_APPLICATION_REGISTRATION_OAUTH_CLIENT_ID_UNIQUE',
  ['oAuthClientId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
@Index('IDX_APPLICATION_REGISTRATION_CREATED_BY_USER_ID', ['createdByUserId'])
@Index('IDX_APPLICATION_REGISTRATION_WORKSPACE_ID', ['ownerWorkspaceId'])
@Check(
  'CHK_NPM_HAS_SOURCE_PACKAGE',
  `"sourceType" <> 'npm' OR "sourcePackage" IS NOT NULL`,
)
export class ApplicationRegistrationEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Field()
  @Column({ nullable: false, type: 'text' })
  name: string;

  @Field()
  @Column({ nullable: false, type: 'text' })
  oAuthClientId: string;

  @Column({ nullable: true, type: 'text' })
  oAuthClientSecretHash: string | null;

  @Field(() => [String])
  @Column({ type: 'text', array: true, default: '{}' })
  oAuthRedirectUris: string[];

  @Field(() => [String])
  @Column({ type: 'text', array: true, default: '{}' })
  oAuthScopes: string[];

  @Column({ nullable: true, type: 'uuid' })
  createdByUserId: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: Relation<UserEntity> | null;

  // Ownership (who can edit). Null for catalog-synced marketplace apps that
  // have no explicit owner — these are managed via the Admin Panel.
  @Field(() => UUIDScalarType, { nullable: true })
  @Column({ name: 'workspaceId', nullable: true, type: 'uuid' })
  ownerWorkspaceId: string | null;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity> | null;

  @Field(() => ApplicationRegistrationSourceType)
  @Column({
    type: 'text',
    default: ApplicationRegistrationSourceType.LOCAL,
  })
  sourceType: ApplicationRegistrationSourceType;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  sourcePackage: string | null;

  @Column({ nullable: true, type: 'uuid' })
  tarballFileId: string | null;

  @OneToOne(() => FileEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'tarballFileId' })
  tarballFile: Relation<FileEntity> | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  latestAvailableVersion: string | null;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  isListed: boolean;

  @Field(() => Boolean)
  @Column({ name: 'isFeatured', type: 'boolean', default: false })
  isFeatured: boolean;

  // Auto-installed on every new workspace; existing workspaces are
  // backfilled by the `install-pre-installed-apps` CLI command.
  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  isPreInstalled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  manifest: Manifest | null;

  @Field(() => String, { nullable: true })
  get logoUrl(): string | null {
    return this.manifest?.application?.logoUrl ?? null;
  }

  @OneToMany(
    () => ApplicationRegistrationVariableEntity,
    (variable) => variable.applicationRegistration,
    { onDelete: 'CASCADE' },
  )
  variables: Relation<ApplicationRegistrationVariableEntity[]>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
