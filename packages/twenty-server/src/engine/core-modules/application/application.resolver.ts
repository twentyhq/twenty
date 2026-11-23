import { UseFilters, UseGuards } from '@nestjs/common';
import { Context, Parent, Query, ResolveField } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationContentDTO } from 'src/engine/core-modules/application/application-content/dtos/application-content.dto';
import { ApplicationContentService } from 'src/engine/core-modules/application/application-content/application-content.service';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { findMarketplaceConnectListing } from 'src/engine/core-modules/application/application-marketplace/utils/find-marketplace-connect-listing.util';
import { ApplicationGrantRoleLookupService } from 'src/engine/core-modules/application/application-grant-role-lookup/services/application-grant-role-lookup.service';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { ApplicationVariableEntityDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable.dto';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildPublicAssetLogoUrl } from 'src/engine/core-modules/application/utils/build-public-asset-logo-url.util';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SdkClientChecksumsDTO } from 'src/engine/core-modules/sdk-client/dtos/sdk-client-checksums.dto';
import { buildServedSdkClientCoreChecksum } from 'src/engine/core-modules/sdk-client/utils/build-served-sdk-client-core-checksum.util';
import { getInstalledSdkMetadataModule } from 'src/engine/core-modules/sdk-client/utils/get-installed-sdk-metadata-module.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { SettingsMenuItemDTO } from 'src/engine/metadata-modules/settings-menu-item/dtos/settings-menu-item.dto';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { isAgentVisibleToUser } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-agent-visible-to-user.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [],
  }),
)
@MetadataResolver(() => ApplicationDTO)
@UseFilters(ApplicationExceptionFilter)
export class ApplicationResolver {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationStopService: ApplicationStopService,
    private readonly applicationService: ApplicationService,
    private readonly applicationContentService: ApplicationContentService,
    private readonly applicationGrantRoleLookupService: ApplicationGrantRoleLookupService,
    private readonly domainServerConfigService: DomainServerConfigService,
  ) {}

  @Query(() => SdkClientChecksumsDTO, { nullable: true })
  @UseGuards(ApplicationTargetGuard)
  async applicationSdkClientChecksums(
    @ApplicationTargetArg(
      'applicationId',
      { kind: 'applicationId', requireApplicationRegistrationOwnership: false },
      { type: () => UUIDScalarType },
    )
    applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<SdkClientChecksumsDTO | null> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
      ]);

    const application = flatApplicationMaps.byId[applicationId];

    if (!isDefined(application)) {
      return null;
    }

    return {
      core: buildServedSdkClientCoreChecksum(application.sdkClientCoreChecksum),
      metadata: (await getInstalledSdkMetadataModule()).checksum,
    };
  }

  // Surfaces the kill switch so clients can warn users that the app is
  // temporarily stopped and behaving in a degraded way. Kept as a dedicated
  // query so listing applications does not trigger one Redis read per app.
  @Query(() => Boolean)
  @UseGuards(ApplicationTargetGuard)
  async isApplicationStopped(
    @ApplicationTargetArg('applicationUniversalIdentifier', {
      kind: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    applicationUniversalIdentifier: string,
  ): Promise<boolean> {
    return this.applicationStopService.isApplicationStopped(
      applicationUniversalIdentifier,
    );
  }

  // Resolves the display url of the logo bundled in the installed
  // application's public assets, so clients never build file urls themselves.
  @ResolveField(() => String, { nullable: true })
  logoUrl(
    @Parent()
    application: Pick<ApplicationDTO, 'id' | 'logo' | 'universalIdentifier'>,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): string | null {
    const bundledLogoUrl = buildPublicAssetLogoUrl({
      logo: application.logo,
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      workspaceId: workspace.id,
      applicationId: application.id,
    });

    if (isDefined(bundledLogoUrl)) {
      return bundledLogoUrl;
    }

    const marketplaceConnectListing = findMarketplaceConnectListing(
      application.universalIdentifier,
    );

    return isDefined(marketplaceConnectListing)
      ? new URL(
          marketplaceConnectListing.logoPath,
          this.domainServerConfigService.getBaseUrl(),
        ).toString()
      : null;
  }

  @ResolveField(() => String, { nullable: true })
  description(
    @Parent()
    application: Pick<ApplicationDTO, 'description' | 'universalIdentifier'>,
  ): string | null {
    return (
      findMarketplaceConnectListing(application.universalIdentifier)
        ?.description ??
      application.description ??
      null
    );
  }

  @ResolveField(() => UUIDScalarType, { nullable: true })
  async grantRoleId(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace() { id: workspaceId }: Pick<WorkspaceEntity, 'id'>,
  ): Promise<string | null> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);
    const flatApplication = flatApplicationMaps.byId[application.id];

    if (!isDefined(flatApplication)) {
      return null;
    }

    return (
      (await this.applicationGrantRoleLookupService.findGrantRoleId({
        workspaceId,
        flatApplication,
      })) ?? null
    );
  }

  @ResolveField(() => String, {
    nullable: true,
    deprecationReason: 'Use requestedRoleId instead',
  })
  defaultRoleId(
    @Parent() application: Pick<ApplicationDTO, 'requestedRoleId'>,
  ): string | null {
    return application.requestedRoleId ?? null;
  }

  @ResolveField(() => Boolean)
  runHealthCheckOnUserPreferences(
    @Parent()
    application: Partial<
      Pick<ApplicationEntity, 'isUserHealthCheckEnabled'> &
        Pick<ApplicationDTO, 'runHealthCheckOnUserPreferences'>
    >,
  ): boolean {
    return (
      application.runHealthCheckOnUserPreferences ??
      application.isUserHealthCheckEnabled ??
      false
    );
  }

  @ResolveField(() => Boolean)
  isUninstallBlockedByOtherWorkspaceInstallations(
    @Parent()
    application: Pick<ApplicationDTO, 'id' | 'applicationRegistrationId'>,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.applicationService.isUninstallBlockedByOtherWorkspaceInstallations(
      {
        applicationId: application.id,
        applicationRegistrationId: application.applicationRegistrationId,
        workspaceId: workspace.id,
      },
    );
  }

  @ResolveField(() => [AgentDTO])
  async agents(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
  ) {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return [];
    }

    const agents = await context.loaders.agentsByApplicationIdLoader.load({
      workspaceId,
      applicationId: application.id,
    });

    return agents.filter((agent) =>
      isAgentVisibleToUser({ agent, userWorkspaceId }),
    );
  }

  @ResolveField(() => [FrontComponentDTO])
  frontComponents(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return [];
    }

    return context.loaders.frontComponentsByApplicationIdLoader.load({
      workspaceId,
      applicationId: application.id,
    });
  }

  @ResolveField(() => [CommandMenuItemDTO])
  commandMenuItems(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return [];
    }

    return context.loaders.commandMenuItemsByApplicationIdLoader.load({
      workspaceId,
      applicationId: application.id,
    });
  }

  @ResolveField(() => [SettingsMenuItemDTO], { nullable: true })
  settingsMenuItems(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return [];
    }

    return context.loaders.settingsMenuItemsByApplicationIdLoader.load({
      workspaceId,
      applicationId: application.id,
    });
  }

  @ResolveField(() => [LogicFunctionDTO])
  logicFunctions(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return [];
    }

    return context.loaders.logicFunctionsByApplicationIdLoader.load({
      workspaceId,
      applicationId: application.id,
    });
  }

  @ResolveField(() => [ObjectMetadataDTO])
  objects(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace()
    { id: workspaceId, workspaceCustomApplicationId }: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return [];
    }

    return context.loaders.objectMetadataByApplicationIdLoader.load({
      workspaceId,
      applicationId: application.id,
    });
  }

  @ResolveField(() => ApplicationContentDTO, { nullable: true })
  async content(
    @Parent()
    application: Pick<ApplicationDTO, 'id' | 'applicationRegistrationId'>,
    @AuthWorkspace()
    {
      id: workspaceId,
      workspaceCustomApplicationId,
    }: Pick<WorkspaceEntity, 'id' | 'workspaceCustomApplicationId'>,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): Promise<ApplicationContentDTO | null> {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
        operation: 'read',
        workspaceCustomApplicationId,
      })
    ) {
      return null;
    }

    return this.applicationContentService.getInstalledApplicationContent({
      workspaceId,
      applicationId: application.id,
      applicationRegistrationId: application.applicationRegistrationId,
    });
  }

  @ResolveField(() => [ApplicationVariableEntityDTO])
  applicationVariables(
    @Parent() application: Pick<ApplicationDTO, 'id'>,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Context() context: { loaders: IDataloaders },
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ) {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
        operation: 'manage',
      })
    ) {
      throw new ForbiddenError(
        new ApplicationException(
          'An application token can only read its own application variables',
          ApplicationExceptionCode.FORBIDDEN,
        ),
      );
    }

    return context.loaders.applicationVariablesByApplicationIdLoader.load({
      workspaceId: workspace.id,
      applicationId: application.id,
    });
  }
}
