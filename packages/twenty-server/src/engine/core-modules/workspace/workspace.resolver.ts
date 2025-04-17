import { UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { CustomDomainValidRecords } from 'src/engine/core-modules/domain-manager/dtos/custom-domain-valid-records';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag-dto';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import {
  AuthProviders,
  PublicWorkspaceDataOutput,
} from 'src/engine/core-modules/workspace/dtos/public-workspace-data-output';
import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { WorkspaceUrls } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';
import { getAuthProvidersByWorkspace } from 'src/engine/core-modules/workspace/utils/get-auth-providers-by-workspace.util';
import { workspaceGraphqlApiExceptionHandler } from 'src/engine/core-modules/workspace/utils/workspace-graphql-api-exception-handler.util';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { AuthApiKey } from 'src/engine/decorators/auth/auth-api-key.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { OriginHeader } from 'src/engine/decorators/auth/origin-header.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleService } from 'src/engine/metadata-modules/role/role.service';
import { GraphqlValidationExceptionFilter } from 'src/filters/graphql-validation-exception.filter';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

import { Workspace } from './workspace.entity';

import { WorkspaceService } from './services/workspace.service';

@Resolver(() => Workspace)
@UseFilters(
  GraphqlValidationExceptionFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly domainManagerService: DomainManagerService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly fileUploadService: FileUploadService,
    private readonly fileService: FileService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly roleService: RoleService,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
  ) {}

  @Query(() => Workspace)
  @UseGuards(WorkspaceAuthGuard)
  async currentWorkspace(@AuthWorkspace() { id }: Workspace) {
    const workspace = await this.workspaceService.findById(id);

    assert(workspace, 'Workspace not found');

    return workspace;
  }

  @Mutation(() => Workspace)
  @UseGuards(UserAuthGuard)
  async activateWorkspace(
    @Args('data') data: ActivateWorkspaceInput,
    @AuthUser() user: User,
    @OriginHeader() origin: string,
  ) {
    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        origin,
      );

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    return await this.workspaceService.activateWorkspace(user, workspace, data);
  }

  @Mutation(() => Workspace)
  @UseGuards(WorkspaceAuthGuard)
  async updateWorkspace(
    @Args('data') data: UpdateWorkspaceInput,
    @AuthWorkspace() workspace: Workspace,
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

  @Mutation(() => String)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(SettingPermissionType.WORKSPACE),
  )
  async uploadWorkspaceLogo(
    @AuthWorkspace() { id }: Workspace,
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
  ): Promise<string> {
    const stream = createReadStream();
    const buffer = await streamToBuffer(stream);
    const fileFolder = FileFolder.WorkspaceLogo;

    const { paths } = await this.fileUploadService.uploadImage({
      file: buffer,
      filename,
      mimeType: mimetype,
      fileFolder,
      workspaceId: id,
    });

    await this.workspaceService.updateOne(id, {
      logo: paths[0],
    });

    const workspaceLogoToken = this.fileService.encodeFileToken({
      workspaceId: id,
    });

    return `${paths[0]}?token=${workspaceLogoToken}`;
  }

  @ResolveField(() => [FeatureFlagDTO], { nullable: true })
  async featureFlags(
    @Parent() workspace: Workspace,
  ): Promise<FeatureFlagDTO[]> {
    const featureFlags = await this.featureFlagService.getWorkspaceFeatureFlags(
      workspace.id,
    );

    return featureFlags.filter((flag) =>
      Object.values(FeatureFlagKey).includes(flag.key),
    );
  }

  @Mutation(() => Workspace)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionsGuard(SettingPermissionType.WORKSPACE),
  )
  async deleteCurrentWorkspace(@AuthWorkspace() { id }: Workspace) {
    return this.workspaceService.deleteWorkspace(id);
  }

  @ResolveField(() => [BillingSubscription])
  async billingSubscriptions(
    @Parent() workspace: Workspace,
  ): Promise<BillingSubscription[] | undefined> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return [];
    }

    try {
      return this.billingSubscriptionRepository.find({
        where: { workspaceId: workspace.id },
      });
    } catch (error) {
      workspaceGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => RoleDTO, { nullable: true })
  async defaultRole(@Parent() workspace: Workspace): Promise<RoleDTO | null> {
    if (!workspace.defaultRoleId) {
      return null;
    }

    return await this.roleService.getRoleById(
      workspace.defaultRoleId,
      workspace.id,
    );
  }

  @ResolveField(() => BillingSubscription, { nullable: true })
  async currentBillingSubscription(
    @Parent() workspace: Workspace,
  ): Promise<BillingSubscription | undefined> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    return this.billingSubscriptionService.getCurrentBillingSubscriptionOrThrow(
      { workspaceId: workspace.id },
    );
  }

  @ResolveField(() => Number)
  async workspaceMembersCount(
    @Parent() workspace: Workspace,
  ): Promise<number | undefined> {
    return await this.userWorkspaceService.getUserCount(workspace.id);
  }

  @ResolveField(() => String)
  async logo(@Parent() workspace: Workspace): Promise<string> {
    if (workspace.logo) {
      try {
        const workspaceLogoToken = this.fileService.encodeFileToken({
          workspaceId: workspace.id,
        });

        return `${workspace.logo}?token=${workspaceLogoToken}`;
      } catch (e) {
        return workspace.logo;
      }
    }

    return workspace.logo ?? '';
  }

  @ResolveField(() => Boolean)
  hasValidEnterpriseKey(): boolean {
    return isDefined(this.twentyConfigService.get('ENTERPRISE_KEY'));
  }

  @ResolveField(() => WorkspaceUrls)
  workspaceUrls(@Parent() workspace: Workspace) {
    return this.domainManagerService.getWorkspaceUrls(workspace);
  }

  @ResolveField(() => Boolean)
  isGoogleAuthEnabled(@Parent() workspace: Workspace) {
    return (
      workspace.isGoogleAuthEnabled &&
      this.twentyConfigService.get('AUTH_GOOGLE_ENABLED')
    );
  }

  @ResolveField(() => Boolean)
  isMicrosoftAuthEnabled(@Parent() workspace: Workspace) {
    return (
      workspace.isMicrosoftAuthEnabled &&
      this.twentyConfigService.get('AUTH_MICROSOFT_ENABLED')
    );
  }

  @ResolveField(() => Boolean)
  isPasswordAuthEnabled(@Parent() workspace: Workspace) {
    return (
      workspace.isPasswordAuthEnabled &&
      this.twentyConfigService.get('AUTH_PASSWORD_ENABLED')
    );
  }

  @Mutation(() => CustomDomainValidRecords, { nullable: true })
  @UseGuards(WorkspaceAuthGuard)
  async checkCustomDomainValidRecords(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<CustomDomainValidRecords | undefined> {
    return this.workspaceService.checkCustomDomainValidRecords(workspace);
  }

  @Query(() => PublicWorkspaceDataOutput)
  async getPublicWorkspaceDataByDomain(
    @OriginHeader() origin: string,
  ): Promise<PublicWorkspaceDataOutput | undefined> {
    try {
      const workspace =
        await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
          origin,
        );

      workspaceValidator.assertIsDefinedOrThrow(workspace);

      let workspaceLogoWithToken = '';

      if (workspace.logo) {
        try {
          const workspaceLogoToken = this.fileService.encodeFileToken({
            workspaceId: workspace.id,
          });

          workspaceLogoWithToken = `${workspace.logo}?token=${workspaceLogoToken}`;
        } catch (e) {
          workspaceLogoWithToken = workspace.logo;
        }
      }

      const systemEnabledProviders: AuthProviders = {
        google: this.twentyConfigService.get('AUTH_GOOGLE_ENABLED'),
        magicLink: false,
        password: this.twentyConfigService.get('AUTH_PASSWORD_ENABLED'),
        microsoft: this.twentyConfigService.get('AUTH_MICROSOFT_ENABLED'),
        sso: [],
      };

      return {
        id: workspace.id,
        logo: workspaceLogoWithToken,
        displayName: workspace.displayName,
        workspaceUrls: this.domainManagerService.getWorkspaceUrls(workspace),
        authProviders: getAuthProvidersByWorkspace({
          workspace,
          systemEnabledProviders,
        }),
      };
    } catch (err) {
      workspaceGraphqlApiExceptionHandler(err);
    }
  }
}
