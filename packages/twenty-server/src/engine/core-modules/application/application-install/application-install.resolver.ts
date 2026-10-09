import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { TriggerInstallApplicationJobResultDTO } from 'src/engine/core-modules/application/application-install/dtos/trigger-install-application-job-result.dto';
import { TriggerInstallApplicationJobInput } from 'src/engine/core-modules/application/application-install/dtos/trigger-install-application-job.input';
import { TriggerInstallApplicationInput } from 'src/engine/core-modules/application/application-install/dtos/trigger-install-application.input';
import { TriggerInstallApplicationResultDTO } from 'src/engine/core-modules/application/application-install/dtos/trigger-install-application-result.dto';
import { TriggerUninstallApplicationJobResultDTO } from 'src/engine/core-modules/application/application-install/dtos/trigger-uninstall-application-job-result.dto';
import { TriggerUninstallApplicationJobInput } from 'src/engine/core-modules/application/application-install/dtos/trigger-uninstall-application-job.input';
import { TriggerUninstallApplicationInput } from 'src/engine/core-modules/application/application-install/dtos/trigger-uninstall-application.input';
import { TriggerUninstallApplicationResultDTO } from 'src/engine/core-modules/application/application-install/dtos/trigger-uninstall-application-result.dto';
import { ApplicationLifecycleJobService } from 'src/engine/core-modules/application/application-install/services/application-lifecycle-job.service';
import { ApplicationUninstallRunnerService } from 'src/engine/core-modules/application/application-install/services/application-uninstall-runner.service';
import { UninstallApplicationInput } from 'src/engine/core-modules/application/application-manifest/dtos/uninstall-application.input';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { UpdateApplicationInput } from 'src/engine/core-modules/application/dtos/update-application.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { ApplicationTargetArgs } from 'src/engine/decorators/auth/application-target-args.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(
  ApplicationExceptionFilter,
  ApplicationRegistrationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@UseInterceptors(WorkspaceMigrationGraphqlApiExceptionInterceptor)
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
    application: false,
  }),
)
export class ApplicationInstallResolver {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationInstallService: ApplicationInstallService,
    private readonly marketplaceQueryService: MarketplaceQueryService,
    private readonly applicationLifecycleJobService: ApplicationLifecycleJobService,
    private readonly applicationUninstallRunnerService: ApplicationUninstallRunnerService,
  ) {}

  @Mutation(() => Boolean, {
    deprecationReason: 'Use installApplication instead',
  })
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async installMarketplaceApp(
    @ApplicationTargetArg('universalIdentifier', {
      kind: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    universalIdentifier: string,
    @Args('version', { type: () => String, nullable: true })
    version: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    await this.installRegisteredApplication({
      universalIdentifier,
      version,
      workspaceId: workspace.id,
    });

    return true;
  }

  @Mutation(() => ApplicationDTO)
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async installApplication(
    @ApplicationTargetArg('universalIdentifier', {
      kind: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    universalIdentifier: string,
    @Args('version', { type: () => String, nullable: true })
    version: string | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    await this.installRegisteredApplication({
      universalIdentifier,
      version,
      workspaceId: workspace.id,
    });

    return this.applicationService.findOneApplicationWithRelationsOrThrow({
      universalIdentifier,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => TriggerInstallApplicationResultDTO)
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async triggerInstallApplication(
    @ApplicationTargetArg<TriggerInstallApplicationInput>('input', {
      kind: 'applicationUniversalIdentifier',
      idKey: 'universalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    { universalIdentifier }: TriggerInstallApplicationInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TriggerInstallApplicationResultDTO> {
    return this.applicationLifecycleJobService.triggerInstallApplication({
      universalIdentifier,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => TriggerUninstallApplicationResultDTO)
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async triggerUninstallApplication(
    @ApplicationTargetArg<TriggerUninstallApplicationInput>('input', {
      kind: 'applicationUniversalIdentifier',
      idKey: 'universalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    { universalIdentifier }: TriggerUninstallApplicationInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TriggerUninstallApplicationResultDTO> {
    return this.applicationLifecycleJobService.triggerUninstallApplication({
      universalIdentifier,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => TriggerInstallApplicationJobResultDTO, {
    deprecationReason: 'Use triggerInstallApplication instead',
  })
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async triggerInstallApplicationJob(
    @ApplicationTargetArg<TriggerInstallApplicationJobInput>('input', {
      kind: 'applicationUniversalIdentifier',
      idKey: 'universalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    { universalIdentifier }: TriggerInstallApplicationJobInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TriggerInstallApplicationJobResultDTO> {
    return this.applicationLifecycleJobService.triggerInstallApplication({
      universalIdentifier,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => TriggerUninstallApplicationJobResultDTO, {
    deprecationReason: 'Use triggerUninstallApplication instead',
  })
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async triggerUninstallApplicationJob(
    @ApplicationTargetArg<TriggerUninstallApplicationJobInput>('input', {
      kind: 'applicationUniversalIdentifier',
      idKey: 'universalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    { universalIdentifier }: TriggerUninstallApplicationJobInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TriggerUninstallApplicationJobResultDTO> {
    return this.applicationLifecycleJobService.triggerUninstallApplication({
      universalIdentifier,
      workspaceId: workspace.id,
    });
  }

  private async installRegisteredApplication(params: {
    universalIdentifier: string;
    version: string | undefined;
    workspaceId: string;
  }): Promise<void> {
    const registration =
      await this.marketplaceQueryService.findRegistrationByUniversalIdentifier(
        params.universalIdentifier,
      );

    await this.applicationInstallService.installApplication({
      appRegistrationId: registration.id,
      version: params.version,
      workspaceId: params.workspaceId,
      hasUserApprovedCapabilities: true,
    });
  }

  @Mutation(() => ApplicationDTO)
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async updateApplication(
    @ApplicationTargetArg(
      'id',
      { kind: 'applicationId', requireApplicationRegistrationOwnership: false },
      { type: () => UUIDScalarType },
    )
    id: string,
    @Args('input') input: UpdateApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.applicationService.findOneApplicationWithRelationsOrThrow({
      id,
      workspaceId,
    });

    return this.applicationService.update(id, {
      ...(isDefined(input.autoUpgrade)
        ? { autoUpgrade: input.autoUpgrade }
        : {}),
      workspaceId,
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async uninstallApplication(
    @ApplicationTargetArgs<UninstallApplicationInput>({
      kind: 'applicationUniversalIdentifier',
      idKey: 'universalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    { universalIdentifier }: UninstallApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.applicationUninstallRunnerService.uninstallApplication({
      universalIdentifier,
      workspaceId,
    });

    return true;
  }
}
