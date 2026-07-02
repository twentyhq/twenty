import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationManifestExportService } from 'src/engine/core-modules/application/application-manifest/application-manifest-export.service';
import { ApplicationManifestExportDTO } from 'src/engine/core-modules/application/application-manifest/dtos/application-manifest-export.dto';
import { ExportApplicationInput } from 'src/engine/core-modules/application/application-manifest/dtos/export-application.input';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(ApplicationExceptionFilter, AuthGraphqlApiExceptionFilter)
@UseGuards(WorkspaceAuthGuard)
export class ApplicationManifestExportResolver {
  constructor(
    private readonly applicationManifestExportService: ApplicationManifestExportService,
  ) {}

  @Query(() => ApplicationManifestExportDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.APPLICATIONS))
  async exportApplication(
    @Args() { universalIdentifier }: ExportApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<ApplicationManifestExportDTO> {
    return this.applicationManifestExportService.exportApplicationManifest({
      workspaceId,
      universalIdentifier,
    });
  }
}
