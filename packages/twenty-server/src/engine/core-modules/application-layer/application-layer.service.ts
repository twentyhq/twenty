import { Injectable } from '@nestjs/common';

import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationLayerService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

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
