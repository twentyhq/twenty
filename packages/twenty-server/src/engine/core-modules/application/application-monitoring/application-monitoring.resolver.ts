import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationMonitoringService } from 'src/engine/core-modules/application/application-monitoring/application-monitoring.service';
import { ApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/application-monitoring.dto';
import { ApplicationRegistrationExceptionFilter } from 'src/engine/core-modules/application/application-registration/application-registration-exception-filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApplicationTargetArg } from 'src/engine/decorators/auth/application-target-arg.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { ApplicationTargetGuard } from 'src/engine/guards/application-target.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(
  ApplicationRegistrationExceptionFilter,
  ApplicationExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
export class ApplicationMonitoringResolver {
  constructor(
    private readonly applicationMonitoringService: ApplicationMonitoringService,
  ) {}

  @UseGuards(
    AuthPrincipalGuard({
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: false,
      oauthClient: false,
      application: false,
    }),
    SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
    ApplicationTargetGuard,
  )
  @Query(() => ApplicationMonitoringDTO)
  async findApplicationRegistrationMonitoring(
    @ApplicationTargetArg('id', {
      kind: 'applicationRegistrationId',
      requireApplicationRegistrationOwnership: true,
    })
    applicationRegistrationId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @Args('periodStart', { type: () => Date, nullable: true })
    periodStart?: Date,
    @Args('periodEnd', { type: () => Date, nullable: true })
    periodEnd?: Date,
  ): Promise<ApplicationMonitoringDTO> {
    return this.applicationMonitoringService.getMonitoring({
      applicationRegistrationId,
      viewerWorkspaceId: workspaceId,
      periodStart,
      periodEnd,
    });
  }
}
