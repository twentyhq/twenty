import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { type JobGroupConfigByKey } from 'src/engine/core-modules/job-group/types/job-group-config-by-key.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const JOB_GROUP_CONFIG_BY_KEY_ROWS_REQUIREMENT = {
  jobGroup: true,
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('jobGroupConfigByKey', { packingPonderation: 1 })
export class JobGroupConfigByKeyCacheService extends WorkspaceCacheProvider<JobGroupConfigByKey> {
  override readonly rowsRequirement = JOB_GROUP_CONFIG_BY_KEY_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof JOB_GROUP_CONFIG_BY_KEY_ROWS_REQUIREMENT
  >): JobGroupConfigByKey {
    return Object.fromEntries(
      rows.jobGroup.map(({ key, limiter }) => [key, { limiter }]),
    );
  }
}
