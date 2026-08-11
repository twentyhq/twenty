import {
  Controller,
  Get,
  Logger,
  Param,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { pipeline } from 'stream/promises';

import { Response } from 'express';
import { ApiPath, FileFolder } from 'twenty-shared/types';

import { ApplicationRestApiExceptionFilter } from 'src/engine/core-modules/application/application-rest-api-exception.filter';
import { FrontComponentSharedDependenciesService } from 'src/engine/core-modules/application/front-component-shared-dependencies/front-component-shared-dependencies.service';
import { extractChecksumFromCacheKey } from 'src/engine/core-modules/application/front-component-shared-dependencies/utils/extract-checksum-from-cache-key.util';
import { getSharedDependenciesBundleCacheControl } from 'src/engine/core-modules/application/front-component-shared-dependencies/utils/get-shared-dependencies-bundle-cache-control.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { PRESIGNED_URL_NO_STORE_CACHE_CONTROL } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { setFileResponseHeaders } from 'src/engine/core-modules/file/utils/set-file-response-headers.utils';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller(`${ApiPath.Rest}/front-component-shared-dependencies`)
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ApplicationRestApiExceptionFilter)
export class FrontComponentSharedDependenciesController {
  private readonly logger = new Logger(
    FrontComponentSharedDependenciesController.name,
  );

  constructor(
    private readonly frontComponentSharedDependenciesService: FrontComponentSharedDependenciesService,
  ) {}

  @Get([':applicationId', ':applicationId/:cacheKey'])
  @UseGuards(NoPermissionGuard)
  async getBuiltSharedDependencies(
    @Res() res: Response,
    @Param('applicationId') applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Param('cacheKey') cacheKey?: string,
  ) {
    const { fileResponse, sharedDependenciesChecksum } =
      await this.frontComponentSharedDependenciesService
        .getBuiltSharedDependenciesPresignedUrlOrStream({
          applicationId,
          workspaceId: workspace.id,
        })
        .catch((error) => {
          if (
            error instanceof FileStorageException &&
            error.code === FileStorageExceptionCode.FILE_NOT_FOUND
          ) {
            throw new ApplicationException(
              `Shared dependencies bundle not found for application "${applicationId}"`,
              ApplicationExceptionCode.ENTITY_NOT_FOUND,
            );
          }

          if (!(error instanceof ApplicationException)) {
            this.logger.error(
              'getBuiltSharedDependenciesPresignedUrlOrStream failed unexpectedly',
              { error },
            );
          }

          throw error;
        });

    if (fileResponse.type === 'redirect') {
      res.setHeader('Cache-Control', PRESIGNED_URL_NO_STORE_CACHE_CONTROL);

      return res.json({ url: fileResponse.presignedUrl });
    }

    setFileResponseHeaders(
      res,
      fileResponse.mimeType,
      FileFolder.BuiltFrontComponent,
    );
    res.setHeader(
      'Cache-Control',
      getSharedDependenciesBundleCacheControl({
        requestedChecksum: extractChecksumFromCacheKey(cacheKey),
        sharedDependenciesChecksum,
      }),
    );

    try {
      await pipeline(fileResponse.stream, res);
    } catch (error) {
      this.logger.error(
        'Shared dependencies bundle stream failed mid-transfer',
        { error },
      );

      if (!res.headersSent) {
        throw error;
      }

      res.destroy();
    }
  }
}
