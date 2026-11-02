import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isObject } from '@sniptt/guards';
import isEqual from 'lodash.isequal';
import { FileFolder, type IframeMediaPermission } from 'twenty-shared/types';
import {
  intersectIframeMediaPermissions,
  parseJson,
} from 'twenty-shared/utils';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { buildApplicationIframeMediaPermissionGrantQuery } from 'src/engine/core-modules/application/utils/build-application-iframe-media-permission-grant-query.util';
import { toRequestedIframeMediaPermissionsOrThrow } from 'src/engine/core-modules/application/utils/to-requested-iframe-media-permissions-or-throw.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const APPLICATION_MANIFEST_FILE_NAME = 'manifest.json';

@Injectable()
export class ApplicationIframeMediaPermissionService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async findRequestedPermissions({
    universalIdentifier,
    workspaceId,
  }: Pick<ApplicationEntity, 'universalIdentifier' | 'workspaceId'>): Promise<
    IframeMediaPermission[]
  > {
    const resource = {
      fileFolder: FileFolder.Source,
      applicationUniversalIdentifier: universalIdentifier,
      workspaceId,
      resourcePath: APPLICATION_MANIFEST_FILE_NAME,
    };

    if (!(await this.fileStorageService.checkFileExists(resource))) {
      return [];
    }

    const manifestBuffer = await streamToBuffer(
      await this.fileStorageService.readFile(resource),
    );
    const manifest = parseJson<unknown>(manifestBuffer.toString());

    if (
      !isObject(manifest) ||
      !('application' in manifest) ||
      !isObject(manifest.application)
    ) {
      return [];
    }

    return toRequestedIframeMediaPermissionsOrThrow(
      'requestedIframeMediaPermissions' in manifest.application
        ? manifest.application.requestedIframeMediaPermissions
        : undefined,
    );
  }

  async approve({
    applicationId,
    workspaceId,
    approvedIframeMediaPermissions,
  }: {
    applicationId: string;
    workspaceId: string;
    approvedIframeMediaPermissions: IframeMediaPermission[];
  }): Promise<ApplicationEntity> {
    const application = await this.applicationService.findOneApplicationOrThrow(
      {
        id: applicationId,
        workspaceId,
      },
    );
    const requestedPermissions =
      await this.findRequestedPermissions(application);
    const approvedPermissions = toRequestedIframeMediaPermissionsOrThrow(
      approvedIframeMediaPermissions,
    );
    const allowedPermissions = intersectIframeMediaPermissions({
      permissions: approvedPermissions,
      allowedPermissions: requestedPermissions,
    });

    if (!isEqual(approvedPermissions, allowedPermissions)) {
      throw new ApplicationException(
        'Approved iframe media permissions are not requested by the installed application',
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`The application's requested permissions have changed. Review them again before approving.`,
        },
      );
    }

    return this.applicationService.update(applicationId, {
      workspaceId,
      grantedIframeMediaPermissions: () =>
        buildApplicationIframeMediaPermissionGrantQuery(approvedPermissions),
    });
  }
}
