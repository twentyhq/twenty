import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import {
  ALLOWED_SDK_MODULES,
  type SdkModuleName,
} from 'src/engine/core-modules/sdk-client/constants/allowed-sdk-modules';
import { SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { getInstalledSdkMetadataModule } from 'src/engine/core-modules/sdk-client/utils/get-installed-sdk-metadata-module.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Controller('rest/sdk-client')
@UseGuards(WorkspaceAuthGuard)
export class SdkClientController {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly sdkClientArchiveService: SdkClientArchiveService,
  ) {}

  @Get([':applicationId/:moduleName', ':applicationId/:moduleName/:cacheKey'])
  @UseGuards(NoPermissionGuard)
  async getSdkModule(
    @Res() res: Response,
    @Param('applicationId') applicationId: string,
    @Param('moduleName') moduleName: SdkModuleName,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (!ALLOWED_SDK_MODULES.includes(moduleName)) {
      throw new NotFoundException(
        `SDK module "${moduleName}" not found. Allowed: ${ALLOWED_SDK_MODULES.join(', ')}`,
      );
    }

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatApplicationMaps',
      ]);

    const application = flatApplicationMaps.byId[applicationId];

    if (!isDefined(application)) {
      throw new NotFoundException(
        `Application "${applicationId}" not found in workspace "${workspace.id}"`,
      );
    }

    // The metadata module is instance-wide (the metadata GraphQL schema is
    // the same for every workspace and application), so it is served from the
    // installed package rather than the per-application archive. This makes
    // it fresh from the first request after a release, with no dependency on
    // archive regeneration. The core module stays archive-served: it embeds
    // the application-scoped schema.
    const fileBuffer =
      moduleName === 'metadata'
        ? (await getInstalledSdkMetadataModule()).moduleBuffer
        : await this.sdkClientArchiveService.getClientModuleFromArchive({
            workspaceId: workspace.id,
            applicationId,
            applicationUniversalIdentifier: application.universalIdentifier,
            moduleName,
          });

    res.setHeader('Content-Type', 'application/javascript');
    res.send(fileBuffer);
  }
}
