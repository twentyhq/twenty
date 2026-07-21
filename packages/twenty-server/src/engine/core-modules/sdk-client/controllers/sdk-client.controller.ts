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
import {
  SDK_CLIENT_MODULE_CACHE_CONTROL,
  SDK_CLIENT_MODULE_NO_STORE_CACHE_CONTROL,
} from 'src/engine/core-modules/sdk-client/constants/sdk-client-module-cache-control';
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

  @Get(['metadata', 'metadata/:checksum'])
  @UseGuards(NoPermissionGuard)
  async getInstanceSdkMetadataModule(
    @Res() res: Response,
    @Param('checksum') checksum?: string,
  ) {
    const { moduleBuffer, checksum: servedModuleChecksum } =
      await getInstalledSdkMetadataModule();

    this.sendSdkModule({
      res,
      moduleBuffer,
      servedModuleChecksum,
      requestedChecksum: checksum,
    });
  }

  @Get([':applicationId/:moduleName', ':applicationId/:moduleName/:checksum'])
  @UseGuards(NoPermissionGuard)
  async getSdkModule(
    @Res() res: Response,
    @Param('applicationId') applicationId: string,
    @Param('moduleName') moduleName: SdkModuleName,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Param('checksum') checksum?: string,
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

    const { moduleBuffer, checksum: servedModuleChecksum } =
      moduleName === 'metadata'
        ? await getInstalledSdkMetadataModule()
        : {
            moduleBuffer:
              await this.sdkClientArchiveService.getClientModuleFromArchive({
                workspaceId: workspace.id,
                applicationId,
                applicationUniversalIdentifier: application.universalIdentifier,
                moduleName,
              }),
            checksum: application.sdkClientCoreChecksum,
          };

    this.sendSdkModule({
      res,
      moduleBuffer,
      servedModuleChecksum,
      requestedChecksum: checksum,
    });
  }

  private sendSdkModule({
    res,
    moduleBuffer,
    servedModuleChecksum,
    requestedChecksum,
  }: {
    res: Response;
    moduleBuffer: Buffer;
    servedModuleChecksum: string | null;
    requestedChecksum?: string;
  }) {
    const isChecksumMatch =
      isDefined(requestedChecksum) &&
      requestedChecksum === servedModuleChecksum;

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Cache-Control',
      isChecksumMatch
        ? SDK_CLIENT_MODULE_CACHE_CONTROL
        : SDK_CLIENT_MODULE_NO_STORE_CACHE_CONTROL,
    );
    res.send(moduleBuffer);
  }
}
