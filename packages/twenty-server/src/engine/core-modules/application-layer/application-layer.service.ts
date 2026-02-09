import { Injectable } from '@nestjs/common';

import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
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
}
