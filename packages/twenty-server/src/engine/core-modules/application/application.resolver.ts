import { UseFilters, UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveField } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationStopService } from 'src/engine/core-modules/application/application-stop/application-stop.service';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
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
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SdkClientChecksumsDTO } from 'src/engine/core-modules/sdk-client/dtos/sdk-client-checksums.dto';
import { getInstalledSdkMetadataModule } from 'src/engine/core-modules/sdk-client/utils/get-installed-sdk-metadata-module.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentDTO } from 'src/engine/metadata-modules/ai/ai-agent/dtos/agent.dto';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { LogicFunctionDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function.dto';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SettingsMenuItemDTO } from 'src/engine/metadata-modules/settings-menu-item/dtos/settings-menu-item.dto';
import { SettingsMenuItemEntity } from 'src/engine/metadata-modules/settings-menu-item/entities/settings-menu-item.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

// findOneApplication preloads these lists, findManyApplications leaves them to the field resolvers
type ApplicationWithLists = Pick<
  ApplicationEntity,
  | 'id'
  | 'agents'
  | 'frontComponents'
  | 'commandMenuItems'
  | 'settingsMenuItems'
  | 'logicFunctions'
  | 'objects'
  | 'applicationVariables'
>;

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  NoPermissionGuard,
)
@MetadataResolver(() => ApplicationDTO)
@UseFilters(ApplicationExceptionFilter)
export class ApplicationResolver {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationStopService: ApplicationStopService,
    private readonly applicationService: ApplicationService,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    @InjectWorkspaceScopedRepository(FrontComponentEntity)
    private readonly frontComponentRepository: WorkspaceScopedRepository<FrontComponentEntity>,
    @InjectWorkspaceScopedRepository(CommandMenuItemEntity)
    private readonly commandMenuItemRepository: WorkspaceScopedRepository<CommandMenuItemEntity>,
    @InjectWorkspaceScopedRepository(SettingsMenuItemEntity)
    private readonly settingsMenuItemRepository: WorkspaceScopedRepository<SettingsMenuItemEntity>,
    @InjectWorkspaceScopedRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: WorkspaceScopedRepository<LogicFunctionEntity>,
    @InjectWorkspaceScopedRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: WorkspaceScopedRepository<ObjectMetadataEntity>,
    @InjectWorkspaceScopedRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: WorkspaceScopedRepository<ApplicationVariableEntity>,
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
      core: application.sdkClientCoreChecksum,
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
    @Parent() application: Pick<ApplicationDTO, 'id' | 'logo'>,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): string | null {
    return buildPublicAssetLogoUrl({
      logo: application.logo,
      serverUrl: this.twentyConfigService.get('SERVER_URL'),
      workspaceId: workspace.id,
      applicationId: application.id,
    });
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
  agents(
    @Parent() application: ApplicationWithLists,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): AgentEntity[] | Promise<AgentEntity[]> {
    return (
      application.agents ??
      this.agentRepository.find(workspace.id, {
        where: { applicationId: application.id },
      })
    );
  }

  @ResolveField(() => [FrontComponentDTO])
  frontComponents(
    @Parent() application: ApplicationWithLists,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): FrontComponentEntity[] | Promise<FrontComponentEntity[]> {
    return (
      application.frontComponents ??
      this.frontComponentRepository.find(workspace.id, {
        where: { applicationId: application.id },
      })
    );
  }

  @ResolveField(() => [CommandMenuItemDTO])
  commandMenuItems(
    @Parent() application: ApplicationWithLists,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): CommandMenuItemEntity[] | Promise<CommandMenuItemEntity[]> {
    return (
      application.commandMenuItems ??
      this.commandMenuItemRepository.find(workspace.id, {
        where: { applicationId: application.id },
      })
    );
  }

  @ResolveField(() => [SettingsMenuItemDTO], { nullable: true })
  settingsMenuItems(
    @Parent() application: ApplicationWithLists,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): SettingsMenuItemEntity[] | Promise<SettingsMenuItemEntity[]> {
    return (
      application.settingsMenuItems ??
      this.settingsMenuItemRepository.find(workspace.id, {
        where: { applicationId: application.id },
      })
    );
  }

  @ResolveField(() => [LogicFunctionDTO])
  logicFunctions(
    @Parent() application: ApplicationWithLists,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): LogicFunctionEntity[] | Promise<LogicFunctionEntity[]> {
    return (
      application.logicFunctions ??
      this.logicFunctionRepository.find(workspace.id, {
        where: { applicationId: application.id },
      })
    );
  }

  @ResolveField(() => [ObjectMetadataDTO])
  objects(
    @Parent() application: ApplicationWithLists,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): ObjectMetadataEntity[] | Promise<ObjectMetadataEntity[]> {
    return (
      application.objects ??
      this.objectMetadataRepository.find(workspace.id, {
        where: { applicationId: application.id },
      })
    );
  }

  @ResolveField(() => [ApplicationVariableEntityDTO])
  applicationVariables(
    @Parent() application: ApplicationWithLists,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
  ): ApplicationVariableEntity[] | Promise<ApplicationVariableEntity[]> {
    if (
      !canCallerReachApplication({
        callingApplication,
        applicationId: application.id,
      })
    ) {
      throw new ForbiddenError(
        new ApplicationException(
          'An application token can only read its own application variables',
          ApplicationExceptionCode.FORBIDDEN,
        ),
      );
    }

    return (
      application.applicationVariables ??
      this.applicationVariableRepository.find(workspace.id, {
        where: { applicationId: application.id },
      })
    );
  }
}
