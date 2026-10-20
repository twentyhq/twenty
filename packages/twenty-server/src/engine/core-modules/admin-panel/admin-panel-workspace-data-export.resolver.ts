import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import {
  ConflictError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceDataExportDTO } from 'src/engine/core-modules/workspace-data-export/dtos/workspace-data-export.dto';
import { WorkspaceDataExportService } from 'src/engine/core-modules/workspace-data-export/services/workspace-data-export.service';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';
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
  AdminPanelGuard,
)
export class AdminPanelWorkspaceDataExportResolver {
  constructor(
    private readonly workspaceDataExportService: WorkspaceDataExportService,
  ) {}

  @Query(() => [WorkspaceDataExportDTO])
  async workspaceDataExports(
    @Args('workspaceId', { type: () => UUIDScalarType }) workspaceId: string,
  ): Promise<WorkspaceDataExportDTO[]> {
    return this.workspaceDataExportService.findMany(workspaceId);
  }

  @Mutation(() => WorkspaceDataExportDTO)
  async createWorkspaceDataExport(
    @Args('workspaceId', { type: () => UUIDScalarType }) workspaceId: string,
  ): Promise<WorkspaceDataExportDTO> {
    try {
      return await this.workspaceDataExportService.create(workspaceId);
    } catch (error) {
      if (error instanceof WorkspaceDataExportException) {
        throw error.code === 'WORKSPACE_NOT_FOUND'
          ? new NotFoundError(error)
          : new ConflictError(error);
      }

      throw error;
    }
  }
}
