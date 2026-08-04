import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';

import { pipeline } from 'stream/promises';

import { Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import {
  APPLICATION_VENDOR_CACHE_CONTROL,
  APPLICATION_VENDOR_NO_STORE_CACHE_CONTROL,
} from 'src/engine/core-modules/application/application-vendor/constants/application-vendor-cache-control.constant';
import { ApplicationVendorService } from 'src/engine/core-modules/application/application-vendor/application-vendor.service';
import { extractChecksumFromCacheKey } from 'src/engine/core-modules/application/application-vendor/utils/extract-checksum-from-cache-key.util';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { PRESIGNED_URL_NO_STORE_CACHE_CONTROL } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/application-vendor')
@UseGuards(WorkspaceAuthGuard)
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
          throw new NotFoundException(
            `Vendor bundle not found for application "${applicationId}"`,
          );
        }

        throw error;
      });

    if (fileResponse.type === 'redirect') {
      res.setHeader('Cache-Control', PRESIGNED_URL_NO_STORE_CACHE_CONTROL);

      return res.json({ url: fileResponse.presignedUrl });
    }

    const requestedChecksum = extractChecksumFromCacheKey(cacheKey);
    const isChecksumMatch =
      isDefined(requestedChecksum) && requestedChecksum === vendorChecksum;

    res.setHeader('Content-Type', fileResponse.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Cache-Control',
      isChecksumMatch
        ? APPLICATION_VENDOR_CACHE_CONTROL
        : APPLICATION_VENDOR_NO_STORE_CACHE_CONTROL,
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
