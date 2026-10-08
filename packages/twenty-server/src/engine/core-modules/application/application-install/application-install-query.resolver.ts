import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationLifecycleJobService } from 'src/engine/core-modules/application/application-install/services/application-lifecycle-job.service';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { resolveTargetApplicationOrThrow } from 'src/engine/core-modules/application/utils/resolve-target-application-or-throw.util';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { JobStatusDTO } from 'src/engine/core-modules/message-queue/dtos/job-status.dto';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceMigrationGraphqlApiExceptionInterceptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-graphql-api-exception.interceptor';

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
    application: true,
  }),
)
export class ApplicationInstallQueryResolver {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationLifecycleJobService: ApplicationLifecycleJobService,
  ) {}

  @Query(() => [ApplicationDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  @AllowSuspendedWorkspace()
  async findManyApplications(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.applicationService.findManyApplications(workspaceId);
  }

  @Query(() => ApplicationDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async findOneApplication(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthApplication({ allowUndefined: true })
    callingApplication: FlatApplication | undefined,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
    @Args('universalIdentifier', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    universalIdentifier?: string,
  ) {
    const { targetApplicationId, targetApplicationUniversalIdentifier } =
      resolveTargetApplicationOrThrow({
        callingApplication,
        applicationId: id,
        applicationUniversalIdentifier: universalIdentifier,
      });

    return await this.applicationService.findOneApplicationWithRelationsOrThrow(
      {
        id: targetApplicationId,
        universalIdentifier: targetApplicationUniversalIdentifier,
        workspaceId,
      },
    );
  }

  @Query(() => JobStatusDTO, { nullable: true })
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async findInstallApplicationJobStatus(
    @ApplicationTargetArg('universalIdentifier', {
      kind: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    universalIdentifier: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<JobStatusDTO | null> {
    return this.applicationLifecycleJobService.findInstallApplicationJobStatus({
      universalIdentifier,
      workspaceId: workspace.id,
    });
  }

  @Query(() => JobStatusDTO, { nullable: true })
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async findUninstallApplicationJobStatus(
    @ApplicationTargetArg('universalIdentifier', {
      kind: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    universalIdentifier: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<JobStatusDTO | null> {
    return this.applicationLifecycleJobService.findUninstallApplicationJobStatus(
      { universalIdentifier, workspaceId: workspace.id },
    );
  }
}
