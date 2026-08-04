import { Injectable, NotFoundException } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileResponse } from 'src/engine/core-modules/file/types/file-response.type';
import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.utils';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const VENDOR_BUNDLE_MIME_TYPE = 'application/javascript';

@Injectable()
export class ApplicationVendorService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getBuiltVendorPresignedUrlOrStream({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<{ fileResponse: FileResponse; vendorChecksum: string | null }> {
    const application = await this.applicationService.findOneApplicationOrThrow(
      {
        id: applicationId,
        workspaceId,
      },
    );

    if (!isDefined(application.vendorBuiltPath)) {
      throw new NotFoundException(
        `Application "${applicationId}" does not declare a vendor bundle`,
      );
    }

    const resourceIdentifier = {
      workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: FileFolder.BuiltFrontComponent,
      resourcePath: application.vendorBuiltPath,
    };

    const presignedUrl = await this.fileStorageService.getPresignedUrl({
      ...resourceIdentifier,
      expiresInSeconds: this.twentyConfigService.get(
        'STORAGE_S3_PRESIGNED_URL_EXPIRES_IN',
      ),
      responseContentType: VENDOR_BUNDLE_MIME_TYPE,
      responseContentDisposition: getContentDisposition(
        VENDOR_BUNDLE_MIME_TYPE,
      ),
    });

    if (presignedUrl) {
      return {
        fileResponse: { type: 'redirect', presignedUrl },
        vendorChecksum: application.vendorChecksum,
      };
    }

    const stream = await this.fileStorageService.readFile(resourceIdentifier);

    return {
      fileResponse: {
        type: 'stream',
        stream,
        mimeType: VENDOR_BUNDLE_MIME_TYPE,
      },
      vendorChecksum: application.vendorChecksum,
    };
  }
}
