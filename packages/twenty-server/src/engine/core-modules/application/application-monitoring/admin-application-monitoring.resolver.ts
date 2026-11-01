import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { ApplicationMonitoringService } from 'src/engine/core-modules/application/application-monitoring/application-monitoring.service';
import { AdminApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/admin-application-monitoring.dto';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@UsePipes(ResolverValidationPipe)
@AdminResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
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
    oauthClient: false,
    application: false,
  }),
  NoPermissionGuard,
)
export class AdminApplicationMonitoringResolver {
  constructor(
    private readonly applicationMonitoringService: ApplicationMonitoringService,
  ) {}

  @UseGuards(AdminPanelGuard)
  @Query(() => AdminApplicationMonitoringDTO)
  async findAdminApplicationRegistrationMonitoring(
    @Args('id') applicationRegistrationId: string,
    @AuthWorkspace() { id: viewerWorkspaceId }: WorkspaceEntity,
    @Args('workspaceId', { type: () => String, nullable: true })
    workspaceId?: string,
    @Args('periodStart', { type: () => Date, nullable: true })
    periodStart?: Date,
    @Args('periodEnd', { type: () => Date, nullable: true })
    periodEnd?: Date,
  ): Promise<AdminApplicationMonitoringDTO> {
    return this.applicationMonitoringService.getAdminMonitoring({
      applicationRegistrationId,
      viewerWorkspaceId,
      workspaceId,
      periodStart,
      periodEnd,
    });
  }
}
