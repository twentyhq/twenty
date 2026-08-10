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
import { ApplicationVendorService } from 'src/engine/core-modules/application/application-vendor/application-vendor.service';
import { extractChecksumFromCacheKey } from 'src/engine/core-modules/application/application-vendor/utils/extract-checksum-from-cache-key.util';
import { getVendorBundleCacheControl } from 'src/engine/core-modules/application/application-vendor/utils/get-vendor-bundle-cache-control.util';
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

@Controller(`${ApiPath.Rest}/application-vendor`)
@UseGuards(WorkspaceAuthGuard)
@UseFilters(ApplicationRestApiExceptionFilter)
export class ApplicationVendorController {
  private readonly logger = new Logger(ApplicationVendorController.name);

  constructor(
    private readonly applicationVendorService: ApplicationVendorService,
  ) {}

  @Get([':applicationId', ':applicationId/:cacheKey'])
  @UseGuards(NoPermissionGuard)
  async getBuiltVendor(
    @Res() res: Response,
    @Param('applicationId') applicationId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Param('cacheKey') cacheKey?: string,
  ) {
    const { fileResponse, vendorChecksum } = await this.applicationVendorService
      .getBuiltVendorPresignedUrlOrStream({
        applicationId,
        workspaceId: workspace.id,
      })
      .catch((error) => {
        if (
          error instanceof FileStorageException &&
          error.code === FileStorageExceptionCode.FILE_NOT_FOUND
        ) {
          throw new ApplicationException(
            `Vendor bundle not found for application "${applicationId}"`,
            ApplicationExceptionCode.ENTITY_NOT_FOUND,
          );
        }

        if (!(error instanceof ApplicationException)) {
          this.logger.error(
            'getBuiltVendorPresignedUrlOrStream failed unexpectedly',
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
      getVendorBundleCacheControl({
        requestedChecksum: extractChecksumFromCacheKey(cacheKey),
        vendorChecksum,
      }),
    );

    try {
      await pipeline(fileResponse.stream, res);
    } catch (error) {
      this.logger.error('Vendor bundle stream failed mid-transfer', { error });

      if (!res.headersSent) {
        throw error;
      }

      res.destroy();
    }
  }
}
