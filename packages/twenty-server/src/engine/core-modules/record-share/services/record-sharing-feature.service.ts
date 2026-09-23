import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordSharingFeatureService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async isRecordSharingEnabled(workspaceId: string): Promise<boolean> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );
    // The cache only contains persisted flags; missing rollout rows must disable invitations.
    return featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARING_ENABLED] === true;
  }
}
