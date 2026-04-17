import {
  type ExecutionContext,
  UseFilters,
  UseGuards,
  UsePipes,
  createParamDecorator,
} from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import assert from 'assert';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { fromFlatApplicationToApplicationDto } from 'src/engine/core-modules/application/utils/from-flat-application-to-application-dto.util';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { BillingEntitlementDTO } from 'src/engine/core-modules/billing/dtos/billing-entitlement.dto';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { DomainValidRecords } from 'src/engine/core-modules/dns-manager/dtos/domain-valid-records';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag.dto';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import {
  type AuthProvidersDTO,
  PublicWorkspaceDataDTO,
  PublicWorkspaceDataSummaryDTO,
} from 'src/engine/core-modules/workspace/dtos/public-workspace-data.dto';
import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { WorkspaceUrlsDTO } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { getAuthBypassProvidersByWorkspace } from 'src/engine/core-modules/workspace/utils/get-auth-bypass-providers-by-workspace.util';
import { getAuthProvidersByWorkspace } from 'src/engine/core-modules/workspace/utils/get-auth-providers-by-workspace.util';
import { workspaceGraphqlApiExceptionHandler } from 'src/engine/core-modules/workspace/utils/workspace-graphql-api-exception-handler.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
  WorkspaceNotFoundDefaultError,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { fromRoleEntityToRoleDto } from 'src/engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { getRequest } from 'src/utils/extract-request';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
const OriginHeader = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    return request.headers['origin'];
  },
);

@MetadataResolver(() => WorkspaceEntity)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileService: FileService,
    private readonly fileUrlService: FileUrlService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly roleService: RoleService,
    private readonly viewService: ViewService,
    private readonly dnsManagerService: DnsManagerService,
    private readonly customDomainManagerService: CustomDomainManagerService,
    private readonly applicationService: ApplicationService,
    private readonly enterprisePlanService: EnterprisePlanService,
  ) {}

  @Query(() => WorkspaceEntity)
  @UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
  async currentWorkspace(@AuthWorkspace() { id }: WorkspaceEntity) {
    const workspace = await this.workspaceService.findById(id);

    assert(workspace, 'Workspace not found');

    return workspace;
  }

  @Mutation(() => WorkspaceEntity)
  @UseGuards(UserAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
  async activateWorkspace(
    @Args('data') data: ActivateWorkspaceInput,
    @AuthUser() user: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return await this.workspaceService.activateWorkspace(user, workspace, data);
  }

  @Mutation(() => WorkspaceEntity)
  @UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
  async updateWorkspace(
    @Args('data') data: UpdateWorkspaceInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey: ApiKeyEntity | undefined,
  ) {
    try {
      return await this.workspaceService.updateWorkspaceById({
        payload: {
          ...data,
          id: workspace.id,
        },
        userWorkspaceId,
        apiKey,
      });
    } catch (error) {
      workspaceGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => String, { nullable: true })
  async routerModel(
    @Parent() _workspace: WorkspaceEntity,
  ): Promise<string | null> {
    return 'auto';
  }

  @ResolveField(() => [FeatureFlagDTO], { nullable: true })
  async featureFlags(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<FeatureFlagDTO[]> {
    const featureFlags = await this.featureFlagService.getWorkspaceFeatureFlags(
      workspace.id,
    );

    return featureFlags.filter((flag) =>
      Object.values(FeatureFlagKey).includes(flag.key),
    );
  }

  @Mutation(() => WorkspaceEntity)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async deleteCurrentWorkspace(@AuthWorkspace() { id }: WorkspaceEntity) {
    return this.workspaceService.deleteWorkspace(id);
  }

  @ResolveField(() => [BillingSubscriptionEntity])
  async billingSubscriptions(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<BillingSubscriptionEntity[] | undefined> {
    if (!this.twentyConfigService.isBillingEnabled()) {
      return [];
    }

    try {
      return this.billingSubscriptionService.getBillingSubscriptions(
        workspace.id,
      );
    } catch (error) {
      workspaceGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => RoleDTO, { nullable: true })
  async defaultRole(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<RoleDTO | null> {
    if (!workspace.defaultRoleId) {
      return null;
    }

    const defaultRoleEntity = await this.roleService.getRoleById(
      workspace.defaultRoleId,
      workspace.id,
    );

    return isDefined(defaultRoleEntity)
      ? fromRoleEntityToRoleDto(defaultRoleEntity)
      : null;
  }

  @ResolveField(() => String, { nullable: true })
  async fastModel(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    return workspace.fastModel;
  }

  @ResolveField(() => String, { nullable: true })
  async smartModel(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    return workspace.smartModel;
  }

  @ResolveField(() => [String], { nullable: true })
  async enabledAiModelIds(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<string[]> {
    return workspace.enabledAiModelIds;
  }

  @ResolveField(() => Boolean, { nullable: false })
  async useRecommendedModels(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return workspace.useRecommendedModels;
  }

  @ResolveField(() => ApplicationDTO, { nullable: true })
  async workspaceCustomApplication(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<ApplicationDTO | null> {
    try {
      const { workspaceCustomFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          {
            workspace,
          },
        );

      return fromFlatApplicationToApplicationDto(
        workspaceCustomFlatApplication,
      );
    } catch {
      // Temporary should be removed after CreateWorkspaceCustomApplicationCommand is run
      return null;
    }
  }

  @ResolveField(() => BillingSubscriptionEntity, { nullable: true })
  async currentBillingSubscription(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<BillingSubscriptionEntity | undefined> {
    if (!this.twentyConfigService.isBillingEnabled()) {
      return;
    }

    return this.billingSubscriptionService.getCurrentBillingSubscription({
      workspaceId: workspace.id,
    });
  }

  @ResolveField(() => Number)
  async workspaceMembersCount(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<number | undefined> {
    return await this.userWorkspaceService.getUserCount(workspace.id);
  }

  @ResolveField(() => String)
  async logo(@Parent() workspace: WorkspaceEntity): Promise<string> {
    if (!isDefined(workspace.logoFileId)) {
      return '';
    }

    return this.fileUrlService.signFileByIdUrl({
      fileId: workspace.logoFileId,
      workspaceId: workspace.id,
      fileFolder: FileFolder.CorePicture,
    });
  }

  @ResolveField(() => [BillingEntitlementDTO])
  billingEntitlements(@Parent() workspace: WorkspaceEntity) {
    return this.billingSubscriptionService.getWorkspaceEntitlements(
      workspace.id,
    );
  }

  @ResolveField(() => Boolean)
  hasValidEnterpriseKey(): boolean {
    return this.enterprisePlanService.hasValidEnterpriseKey();
  }

  @ResolveField(() => Boolean)
  hasValidSignedEnterpriseKey(): boolean {
    return this.enterprisePlanService.hasValidSignedEnterpriseKey();
  }

  @ResolveField(() => Boolean)
  hasValidEnterpriseValidityToken(): boolean {
    return this.enterprisePlanService.hasValidEnterpriseValidityToken();
  }

  @ResolveField(() => WorkspaceUrlsDTO)
  workspaceUrls(@Parent() workspace: WorkspaceEntity) {
    return this.workspaceDomainsService.getWorkspaceUrls(workspace);
  }

  @ResolveField(() => Boolean)
  isGoogleAuthEnabled(@Parent() workspace: WorkspaceEntity) {
    return (
      workspace.isGoogleAuthEnabled &&
      this.twentyConfigService.get('AUTH_GOOGLE_ENABLED')
    );
  }

  @ResolveField(() => String)
  workspaceCustomApplicationId(@Parent() workspace: WorkspaceEntity) {
    return workspace.workspaceCustomApplicationId;
  }

  @ResolveField(() => Boolean)
  isMicrosoftAuthEnabled(@Parent() workspace: WorkspaceEntity) {
    return (
      workspace.isMicrosoftAuthEnabled &&
      this.twentyConfigService.get('AUTH_MICROSOFT_ENABLED')
    );
  }

  @ResolveField(() => Boolean)
  isPasswordAuthEnabled(@Parent() workspace: WorkspaceEntity) {
    return (
      workspace.isPasswordAuthEnabled &&
      this.twentyConfigService.get('AUTH_PASSWORD_ENABLED')
    );
  }

  @ResolveField(() => [ViewDTO])
  async views(
    @Parent() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ): Promise<ViewDTO[]> {
    return this.viewService.findByWorkspaceId(workspace.id, userWorkspaceId);
  }

  @Query(() => PublicWorkspaceDataDTO)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getPublicWorkspaceDataByDomain(
    @OriginHeader() originHeader: string,
    @Args('origin', { nullable: true }) origin?: string,
  ): Promise<PublicWorkspaceDataDTO | undefined> {
    try {
      const systemEnabledProviders: AuthProvidersDTO = {
        google: this.twentyConfigService.get('AUTH_GOOGLE_ENABLED'),
        magicLink: false,
        password: this.twentyConfigService.get('AUTH_PASSWORD_ENABLED'),
        microsoft: this.twentyConfigService.get('AUTH_MICROSOFT_ENABLED'),
        sso: [],
      };

      if (!origin) {
        return {
          id: 'default-workspace',
          logo: '',
          displayName: 'Default Workspace',
          workspaceUrls: {
            subdomainUrl: originHeader,
            customUrl: originHeader,
          },
          authProviders: systemEnabledProviders,
        };
      }

      const workspace =
        await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
          origin,
        );

      assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

      let workspaceLogoWithToken = '';

      if (isDefined(workspace.logoFileId)) {
        workspaceLogoWithToken = this.fileUrlService.signFileByIdUrl({
          fileId: workspace.logoFileId,
          workspaceId: workspace.id,
          fileFolder: FileFolder.CorePicture,
        });
      }

      return {
        id: workspace.id,
        logo: workspaceLogoWithToken,
        displayName: workspace.displayName,
        workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls(workspace),
        authProviders: getAuthProvidersByWorkspace({
          workspace,
          systemEnabledProviders,
        }),
        authBypassProviders: getAuthBypassProvidersByWorkspace({
          workspace,
          systemEnabledProviders,
        }),
      };
    } catch (err) {
      workspaceGraphqlApiExceptionHandler(err);
    }
  }

  @Query(() => PublicWorkspaceDataSummaryDTO)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async getPublicWorkspaceDataById(
    @Args({
      name: 'id',
      type: () => UUIDScalarType,
      nullable: false,
    })
    id: string,
  ): Promise<PublicWorkspaceDataSummaryDTO | undefined> {
    try {
      const workspace = await this.workspaceService.findOneWorkspaceById(id);

      assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

      const logo = isDefined(workspace.logoFileId)
        ? this.fileUrlService.signFileByIdUrl({
            fileId: workspace.logoFileId,
            workspaceId: workspace.id,
            fileFolder: FileFolder.CorePicture,
          })
        : (workspace.logo ?? '');

      return {
        id: workspace.id,
        logo,
        displayName: workspace.displayName,
      };
    } catch (err) {
      workspaceGraphqlApiExceptionHandler(err);
    }
  }

  @Mutation(() => DomainValidRecords, { nullable: true })
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async checkCustomDomainValidRecords(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<DomainValidRecords | undefined> {
    assertIsDefinedOrThrow(
      workspace.customDomain,
      new WorkspaceException(
        `Custom domain not found`,
        WorkspaceExceptionCode.CUSTOM_DOMAIN_NOT_FOUND,
      ),
    );

    const domainValidRecords = await this.dnsManagerService.refreshHostname(
      workspace.customDomain,
    );

    return this.customDomainManagerService.checkCustomDomainValidRecords(
      workspace,
      domainValidRecords,
    );
  }
}
