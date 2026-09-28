import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@MetadataResolver()
@UseFilters(ApplicationExceptionFilter)
@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
export class ApplicationSchemaResolver {
  constructor(
    private readonly workspaceGraphqlSchemaSDLService: WorkspaceGraphqlSchemaSDLService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Query(() => String)
  async applicationCoreGraphqlSchema(
    @Args('applicationUniversalIdentifier')
    applicationUniversalIdentifier: string,
    @AuthWorkspace() workspace: FlatWorkspace,
  ): Promise<string> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
      ]);

    const applicationId =
      flatApplicationMaps.idByUniversalIdentifier[
        applicationUniversalIdentifier
      ];

    if (!isDefined(applicationId)) {
      throw new ApplicationException(
        `Application ${applicationUniversalIdentifier} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const schemaSDLResult =
      await this.workspaceGraphqlSchemaSDLService.getOrComputeSchemaSDL(
        workspace,
        applicationId,
      );

    if (!isDefined(schemaSDLResult)) {
      throw new ApplicationException(
        'Workspace schema is not available yet',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return schemaSDLResult.sdl;
  }
}
