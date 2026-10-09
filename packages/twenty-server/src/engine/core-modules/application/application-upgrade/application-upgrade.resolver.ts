import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationLifecycleJobService } from 'src/engine/core-modules/application/application-install/services/application-lifecycle-job.service';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { TriggerUpgradeApplicationInput } from 'src/engine/core-modules/application/application-upgrade/dtos/trigger-upgrade-application.input';
import { TriggerUpgradeApplicationResultDTO } from 'src/engine/core-modules/application/application-upgrade/dtos/trigger-upgrade-application-result.dto';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { JobStatusDTO } from 'src/engine/core-modules/message-queue/dtos/job-status.dto';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(
  ApplicationExceptionFilter,
  ApplicationRegistrationExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: false,
  }),
  NoPermissionGuard,
)
export class ApplicationUpgradeResolver {
  constructor(
    private readonly applicationUpgradeService: ApplicationUpgradeService,
    private readonly applicationLifecycleJobService: ApplicationLifecycleJobService,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async upgradeApplication(
    @ApplicationTargetArg('appRegistrationId', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: false,
    })
    appRegistrationId: string,
    @Args('targetVersion') targetVersion: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    return this.applicationUpgradeService.upgradeApplication({
      appRegistrationId,
      targetVersion,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => TriggerUpgradeApplicationResultDTO)
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async triggerUpgradeApplication(
    @ApplicationTargetArg<TriggerUpgradeApplicationInput>('input', {
      kind: 'applicationUniversalIdentifier',
      idKey: 'universalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    { universalIdentifier, targetVersion }: TriggerUpgradeApplicationInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<TriggerUpgradeApplicationResultDTO> {
    return this.applicationLifecycleJobService.triggerUpgradeApplication({
      universalIdentifier,
      targetVersion,
      workspaceId: workspace.id,
    });
  }

  @Query(() => JobStatusDTO, { nullable: true })
  @UseGuards(
    SettingsPermissionGuard(PermissionFlagType.APPLICATIONS),
    ApplicationTargetGuard,
  )
  async findUpgradeApplicationJobStatus(
    @ApplicationTargetArg('universalIdentifier', {
      kind: 'applicationUniversalIdentifier',
      requireApplicationRegistrationOwnership: false,
    })
    universalIdentifier: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<JobStatusDTO | null> {
    return this.applicationLifecycleJobService.findUpgradeApplicationJobStatus({
      universalIdentifier,
      workspaceId: workspace.id,
    });
  }
}
