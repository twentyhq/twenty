import {
  type ExecutionContext,
  UseFilters,
  UseGuards,
  UsePipes,
  createParamDecorator,
} from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import assert from 'assert';

import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { DomainValidRecords } from 'src/engine/core-modules/dns-manager/dtos/domain-valid-records';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag-dto';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SignedFileDTO } from 'src/engine/core-modules/file/file-upload/dtos/signed-file.dto';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import {
  type AuthProvidersDTO,
  PublicWorkspaceDataOutput,
} from 'src/engine/core-modules/workspace/dtos/public-workspace-data-output';
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
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { getRequest } from 'src/utils/extract-request';
import { streamToBuffer } from 'src/utils/stream-to-buffer';
const OriginHeader = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);

    return request.headers['origin'];
  },
);

@Resolver(() => WorkspaceEntity)
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
    private readonly fileUploadService: FileUploadService,
    private readonly fileService: FileService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly roleService: RoleService,
    private readonly viewService: ViewService,
    private readonly dnsManagerService: DnsManagerService,
    private readonly customDomainManagerService: CustomDomainManagerService,
  ) {}

  @Query(() => WorkspaceEntity)
  @UseGuards(WorkspaceAuthGuard)
  async currentWorkspace(@AuthWorkspace() { id }: WorkspaceEntity) {
    const workspace = await this.workspaceService.findById(id);

    assert(workspace, 'Workspace not found');

    return workspace;
  }

  @Mutation(() => WorkspaceEntity)
  @UseGuards(UserAuthGuard, WorkspaceAuthGuard)
  async activateWorkspace(
    @Args('data') data: ActivateWorkspaceInput,
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    return await this.workspaceService.activateWorkspace(user, workspace, data);
  }

  @Mutation(() => WorkspaceEntity)
  @UseGuards(WorkspaceAuthGuard)
  async updateWorkspace(
    @Args('data') data: UpdateWorkspaceInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApiKey() apiKey?: string,
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

  @Mutation(() => SignedFileDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(PermissionFlagType.WORKSPACE),
  )
  async uploadWorkspaceLogo(
    @AuthWorkspace() { id }: WorkspaceEntity,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<SignedFileDTO> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.WorkspaceLogo;

    const { files } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
      workspaceId: id,
    });

    if (!files.length) {
      throw new Error('Failed to upload workspace logo');
    }

    await this.workspaceService.updateOne(id, {
      logo: files[0].path,
    });

    return files[0];
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
    SettingsPermissionsGuard(PermissionFlagType.WORKSPACE),
  )
  async deleteCurrentWorkspace(@AuthWorkspace() { id }: WorkspaceEntity) {
    return this.workspaceService.deleteWorkspace(id);
  }

  @ResolveField(() => [BillingSubscriptionEntity])
  async billingSubscriptions(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<BillingSubscriptionEntity[] | undefined> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
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

    return await this.roleService.getRoleById(
      workspace.defaultRoleId,
      workspace.id,
    );
  }

  @ResolveField(() => String, { nullable: true })
  async routerModel(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<string | null> {
    return workspace.routerModel;
  }

  @ResolveField(() => BillingSubscriptionEntity, { nullable: true })
  async currentBillingSubscription(
    @Parent() workspace: WorkspaceEntity,
  ): Promise<BillingSubscriptionEntity | undefined> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
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
    if (workspace.logo) {
      try {
        return this.fileService.signFileUrl({
          url: workspace.logo,
          workspaceId: workspace.id,
        });
      } catch {
        return workspace.logo;
      }
    }

    return workspace.logo ?? '';
  }

  @ResolveField(() => Boolean)
  hasValidEnterpriseKey(): boolean {
    return isDefined(this.twentyConfigService.get('ENTERPRISE_KEY'));
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
  async views(@Parent() workspace: WorkspaceEntity): Promise<ViewDTO[]> {
    return this.viewService.findByWorkspaceId(workspace.id);
  }

  @Query(() => PublicWorkspaceDataOutput)
  @UseGuards(PublicEndpointGuard)
  async getPublicWorkspaceDataByDomain(
    @OriginHeader() originHeader: string,
    @Args('origin', { nullable: true }) origin?: string,
  ): Promise<PublicWorkspaceDataOutput | undefined> {
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

      if (workspace.logo) {
        try {
          workspaceLogoWithToken = this.fileService.signFileUrl({
            url: workspace.logo,
            workspaceId: workspace.id,
          });
        } catch {
          workspaceLogoWithToken = workspace.logo;
        }
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

  @Mutation(() => DomainValidRecords, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
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
