import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApprovedAccessDomain } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { PostgresCredentials } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';

registerEnumType(WorkspaceActivationStatus, {
  name: 'WorkspaceActivationStatus',
});

@Check(
  'onboarded_workspace_requires_default_role',
  `"activationStatus" IN ('PENDING_CREATION', 'ONGOING_CREATION') OR "defaultRoleId" IS NOT NULL`,
)
@Entity({ name: 'workspace', schema: 'core' })
@ObjectType()
export class Workspace {
  // Fields
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  inviteHash?: string;

  @Field({ nullable: true })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field()
  @Column({ default: true })
  allowImpersonation: boolean;

  @Field()
  @Column({ default: true })
  isPublicInviteLinkEnabled: boolean;

  // Relations
  @OneToMany(() => AppToken, (appToken) => appToken.workspace, {
    cascade: true,
  })
  appTokens: Relation<AppToken[]>;

  @OneToMany(() => KeyValuePair, (keyValuePair) => keyValuePair.workspace, {
    cascade: true,
  })
  keyValuePairs: Relation<KeyValuePair[]>;

  @OneToMany(() => UserWorkspace, (userWorkspace) => userWorkspace.workspace, {
    onDelete: 'CASCADE',
  })
  workspaceUsers: Relation<UserWorkspace[]>;

  @OneToMany(() => FeatureFlag, (featureFlag) => featureFlag.workspace)
  featureFlags: Relation<FeatureFlag[]>;

  @OneToMany(
    () => ApprovedAccessDomain,
    (approvedAccessDomain) => approvedAccessDomain.workspace,
  )
  approvedAccessDomains: Relation<ApprovedAccessDomain[]>;

  @Field({ nullable: true })
  workspaceMembersCount: number;

  @Field(() => WorkspaceActivationStatus)
  @Column({
    type: 'enum',
    enumName: 'workspace_activationStatus_enum',
    enum: WorkspaceActivationStatus,
    default: WorkspaceActivationStatus.INACTIVE,
  })
  activationStatus: WorkspaceActivationStatus;

  @OneToMany(
    () => PostgresCredentials,
    (postgresCredentials) => postgresCredentials.workspace,
  )
  allPostgresCredentials: Relation<PostgresCredentials[]>;

  @OneToMany(
    () => WorkspaceSSOIdentityProvider,
    (workspaceSSOIdentityProviders) => workspaceSSOIdentityProviders.workspace,
  )
  workspaceSSOIdentityProviders: Relation<WorkspaceSSOIdentityProvider[]>;

  @Field()
  @Column({ default: 1 })
  metadataVersion: number;

  @Field()
  @Column({ default: '' })
  databaseUrl: string;

  @Field()
  @Column({ default: '' })
  databaseSchema: string;

  @Field()
  @Column({ unique: true })
  subdomain: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', unique: true, nullable: true })
  customDomain: string | null;

  @Field()
  @Column({ default: true })
  isGoogleAuthEnabled: boolean;

  @Field()
  @Column({ default: true })
  isPasswordAuthEnabled: boolean;

  @Field()
  @Column({ default: true })
  isMicrosoftAuthEnabled: boolean;

  @Field()
  @Column({ default: false })
  isCustomDomainEnabled: boolean;

  @Column({ nullable: true, type: 'uuid' })
  defaultRoleId: string | null;

  @Field(() => RoleDTO, { nullable: true })
  defaultRole: RoleDTO | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  version: string | null;
}
