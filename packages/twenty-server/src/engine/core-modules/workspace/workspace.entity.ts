import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { type Application } from 'cloudflare/resources/zero-trust/access/applications/applications';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
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
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { PostgresCredentialsEntity } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { WorkspaceSSOIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WebhookEntity } from 'src/engine/core-modules/webhook/webhook.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import {
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
  type ModelId,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

registerEnumType(WorkspaceActivationStatus, {
  name: 'WorkspaceActivationStatus',
});

@Check(
  'onboarded_workspace_requires_default_role',
  `"activationStatus" IN ('PENDING_CREATION', 'ONGOING_CREATION') OR "defaultRoleId" IS NOT NULL`,
)
@Entity({ name: 'workspace', schema: 'core' })
@ObjectType('Workspace')
export class WorkspaceEntity {
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

  @Field()
  @Column({ type: 'integer', default: 14 })
  trashRetentionDays: number;

  // Relations
  @OneToMany(() => AppTokenEntity, (appToken) => appToken.workspace, {
    cascade: true,
  })
  appTokens: Relation<AppTokenEntity[]>;

  @OneToMany(
    () => KeyValuePairEntity,
    (keyValuePair) => keyValuePair.workspace,
    {
      cascade: true,
    },
  )
  keyValuePairs: Relation<KeyValuePairEntity[]>;

  @OneToMany(
    () => UserWorkspaceEntity,
    (userWorkspace) => userWorkspace.workspace,
    {
      onDelete: 'CASCADE',
    },
  )
  workspaceUsers: Relation<UserWorkspaceEntity[]>;

  @OneToMany(() => FeatureFlagEntity, (featureFlag) => featureFlag.workspace)
  featureFlags: Relation<FeatureFlagEntity[]>;

  @OneToMany(
    () => ApprovedAccessDomainEntity,
    (approvedAccessDomain) => approvedAccessDomain.workspace,
  )
  approvedAccessDomains: Relation<ApprovedAccessDomainEntity[]>;

  @OneToMany(
    () => EmailingDomainEntity,
    (emailingDomain) => emailingDomain.workspace,
  )
  emailingDomains: Relation<EmailingDomainEntity[]>;

  @OneToMany(() => PublicDomainEntity, (publicDomain) => publicDomain.workspace)
  publicDomains: Relation<PublicDomainEntity[]>;

  @Field({ nullable: true })
  workspaceMembersCount: number;

  @Field(() => WorkspaceActivationStatus)
  @Column({
    type: 'enum',
    enumName: 'workspace_activationStatus_enum',
    enum: WorkspaceActivationStatus,
    default: WorkspaceActivationStatus.INACTIVE,
  })
  @Index('IDX_WORKSPACE_ACTIVATION_STATUS')
  activationStatus: WorkspaceActivationStatus;

  @OneToMany(
    () => PostgresCredentialsEntity,
    (postgresCredentials) => postgresCredentials.workspace,
  )
  allPostgresCredentials: Relation<PostgresCredentialsEntity[]>;

  @OneToMany(
    () => WorkspaceSSOIdentityProviderEntity,
    (workspaceSSOIdentityProviders) => workspaceSSOIdentityProviders.workspace,
  )
  workspaceSSOIdentityProviders: Relation<WorkspaceSSOIdentityProviderEntity[]>;

  @OneToMany(() => AgentEntity, (agent) => agent.workspace, {
    onDelete: 'CASCADE',
  })
  agents: Relation<AgentEntity[]>;

  @OneToMany(() => WebhookEntity, (webhook) => webhook.workspace)
  webhooks: Relation<WebhookEntity[]>;

  @OneToMany(() => ApiKeyEntity, (apiKey) => apiKey.workspace)
  apiKeys: Relation<ApiKeyEntity[]>;

  @Field(() => [ViewDTO], { nullable: true })
  @OneToMany(() => ViewEntity, (view) => view.workspace)
  views: Relation<ViewEntity[]>;

  @Field(() => [ViewFieldDTO], { nullable: true })
  @OneToMany(() => ViewFieldEntity, (viewField) => viewField.workspace)
  viewFields: Relation<ViewFieldEntity[]>;

  @Field(() => [ViewFilterDTO], { nullable: true })
  @OneToMany(() => ViewFilterEntity, (viewFilter) => viewFilter.workspace)
  viewFilters: Relation<ViewFilterEntity[]>;

  @Field(() => [ViewFilterGroupDTO], { nullable: true })
  @OneToMany(
    () => ViewFilterGroupEntity,
    (viewFilterGroup) => viewFilterGroup.workspace,
  )
  viewFilterGroups: Relation<ViewFilterGroupEntity[]>;

  @Field(() => [ViewGroupDTO], { nullable: true })
  @OneToMany(() => ViewGroupEntity, (viewGroup) => viewGroup.workspace)
  viewGroups: Relation<ViewGroupEntity[]>;

  @Field(() => [ViewSortDTO], { nullable: true })
  @OneToMany(() => ViewSortEntity, (viewSort) => viewSort.workspace)
  viewSorts: Relation<ViewSortEntity[]>;

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
  @Column({ default: false })
  isGoogleAuthBypassEnabled: boolean;

  @Field()
  @Column({ default: false })
  isTwoFactorAuthenticationEnforced: boolean;

  @Field()
  @Column({ default: true })
  isPasswordAuthEnabled: boolean;

  @Field()
  @Column({ default: false })
  isPasswordAuthBypassEnabled: boolean;

  @Field()
  @Column({ default: true })
  isMicrosoftAuthEnabled: boolean;

  @Field()
  @Column({ default: false })
  isMicrosoftAuthBypassEnabled: boolean;

  @Field()
  @Column({ default: false })
  isCustomDomainEnabled: boolean;

  @Field(() => [String], { nullable: true })
  @Column({
    type: 'varchar',
    array: true,
    nullable: true,
    default: '{email,profilePicture,firstName,lastName}',
  })
  editableProfileFields: string[] | null;

  // TODO: set as non nullable
  @Column({ nullable: true, type: 'uuid' })
  defaultRoleId: string | null;

  @Field(() => RoleDTO, { nullable: true })
  defaultRole: RoleDTO | null;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  version: string | null;

  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', nullable: false, default: DEFAULT_FAST_MODEL })
  fastModel: ModelId;

  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', nullable: false, default: DEFAULT_SMART_MODEL })
  smartModel: ModelId;

  @Column({ nullable: false, type: 'uuid' })
  workspaceCustomApplicationId: string;

  // TODO: delete
  // This is deprecated
  // If we are in December 2025 you can remove this column from DB
  @Field(() => String, { nullable: false })
  @Column({ type: 'varchar', nullable: false, default: 'auto' })
  routerModel: ModelId;

  @Field(() => ApplicationDTO, { nullable: true })
  @ManyToOne(() => ApplicationEntity, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn({ name: 'workspaceCustomApplicationId' })
  workspaceCustomApplication: Relation<ApplicationEntity>;

  @OneToMany(() => ApplicationEntity, (application) => application.workspace, {
    onDelete: 'CASCADE',
  })
  applications: Relation<Application[]>;
}
