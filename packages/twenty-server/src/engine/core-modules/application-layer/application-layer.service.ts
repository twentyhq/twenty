import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import type { FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

@Injectable()
export class ApplicationLayerService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getAvailablePackages({
    logicFunctionId,
    workspaceId,
  }: {
    logicFunctionId: string;
    workspaceId: string;
  }) {
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
      ]);

    const logicFunctionUniversalIdentifier =
      flatLogicFunctionMaps.universalIdentifierById[logicFunctionId];

    if (!logicFunctionUniversalIdentifier) {
      return {};
    }

    const logicFunction =
      flatLogicFunctionMaps.byUniversalIdentifier[
        logicFunctionUniversalIdentifier
      ];

    if (!logicFunction) {
      return {};
    }

    const application = flatApplicationMaps.byId[logicFunction.applicationId];

    return application?.availablePackages ?? {};
  }

  async hasLayerDependencies(
    flatApplication: FlatApplication,
  ): Promise<boolean> {
    const packageJsonExists = await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'package.json',
    });
    const yarnLockExists = await this.fileStorageService.checkFileExists_v2({
      workspaceId: flatApplication.workspaceId,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      fileFolder: FileFolder.Dependencies,
      resourcePath: 'yarn.lock',
    });

    return packageJsonExists && yarnLockExists;
  }
}
