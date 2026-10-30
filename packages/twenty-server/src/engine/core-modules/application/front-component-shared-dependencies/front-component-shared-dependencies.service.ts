import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileResponse } from 'src/engine/core-modules/file/types/file-response.type';
import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { getFrontComponentSharedDependenciesPath } from 'src/engine/core-modules/application/front-component-shared-dependencies/utils/get-front-component-shared-dependencies-path.util';
import { validateFrontComponentSharedDependenciesChecksumOrThrow } from 'src/engine/core-modules/application/front-component-shared-dependencies/utils/validate-front-component-shared-dependencies-checksum-or-throw.util';

const SHARED_DEPENDENCIES_BUNDLE_MIME_TYPE = 'application/javascript';

@Injectable()
export class FrontComponentSharedDependenciesService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getBuiltSharedDependenciesPresignedUrlOrStream({
    applicationId,
    workspaceId,
    checksum,
  }: {
    applicationId: string;
    workspaceId: string;
    checksum?: string;
  }): Promise<{
    fileResponse: FileResponse;
    frontComponentSharedDependenciesChecksum: string | null;
  }> {
    const application =
      await this.applicationService.findOneApplicationWithRelationsOrThrow({
        id: applicationId,
        workspaceId,
      });

    let builtPath = application.frontComponentSharedDependenciesBuiltPath;

    if (
      isDefined(checksum) &&
      (checksum !== application.frontComponentSharedDependenciesChecksum ||
        !isDefined(builtPath))
    ) {
      builtPath = getFrontComponentSharedDependenciesPath(checksum);
    }

    if (!isDefined(builtPath)) {
      throw new ApplicationException(
        `Application "${applicationId}" does not declare shared dependencies`,
        ApplicationExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const resourceIdentifier = {
      workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: FileFolder.BuiltFrontComponent,
      resourcePath: builtPath,
    };

    const presignedUrl = await this.fileStorageService.getPresignedUrl({
      ...resourceIdentifier,
      expiresInSeconds: this.twentyConfigService.get(
        'STORAGE_S3_PRESIGNED_URL_EXPIRES_IN',
      ),
      responseContentType: SHARED_DEPENDENCIES_BUNDLE_MIME_TYPE,
      responseContentDisposition: getContentDisposition(
        SHARED_DEPENDENCIES_BUNDLE_MIME_TYPE,
      ),
    });

    if (isDefined(presignedUrl)) {
      return {
        fileResponse: { type: 'redirect', presignedUrl },
        frontComponentSharedDependenciesChecksum:
          checksum ?? application.frontComponentSharedDependenciesChecksum,
      };
    }

    const stream = await this.fileStorageService.readFile(resourceIdentifier);

    return {
      fileResponse: {
        type: 'stream',
        stream,
        mimeType: SHARED_DEPENDENCIES_BUNDLE_MIME_TYPE,
      },
      frontComponentSharedDependenciesChecksum:
        checksum ?? application.frontComponentSharedDependenciesChecksum,
    };
  }

  async saveBuiltSharedDependenciesOrThrow({
    applicationId,
    workspaceId,
    source,
    checksum,
  }: {
    applicationId: string;
    workspaceId: string;
    source: string;
    checksum: string;
  }) {
    validateFrontComponentSharedDependenciesChecksumOrThrow({
      source,
      checksum,
    });

    const application =
      await this.applicationService.findOneApplicationWithRelationsOrThrow({
        id: applicationId,
        workspaceId,
      });

    return this.fileStorageService.writeFile({
      workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: FileFolder.BuiltFrontComponent,
      resourcePath: getFrontComponentSharedDependenciesPath(checksum),
      sourceFile: source,
      settings: { isTemporaryFile: false, toDelete: false },
    });
  }
}
