import { Injectable } from '@nestjs/common';

import { type ApplicationVariableUserValueMaps } from 'src/engine/core-modules/application/application-variable/types/application-variable-user-value-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const APPLICATION_VARIABLE_USER_VALUE_ROWS_REQUIREMENT = {
  applicationVariableUserValue: [
    'applicationVariableId',
    'userWorkspaceId',
    'value',
  ],
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('applicationVariableUserValueMaps', { packingPonderation: 1 })
export class WorkspaceApplicationVariableUserValueMapCacheService extends WorkspaceCacheProvider<ApplicationVariableUserValueMaps> {
  override readonly rowsRequirement =
    APPLICATION_VARIABLE_USER_VALUE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof APPLICATION_VARIABLE_USER_VALUE_ROWS_REQUIREMENT
  >): ApplicationVariableUserValueMaps {
    const byApplicationVariableId: ApplicationVariableUserValueMaps['byApplicationVariableId'] =
      {};

    for (const {
      applicationVariableId,
      userWorkspaceId,
      value,
    } of rows.applicationVariableUserValue) {
      const valuesByUserWorkspaceId = (byApplicationVariableId[
        applicationVariableId
      ] ??= {});

      valuesByUserWorkspaceId[userWorkspaceId] = value;
    }

    return { byApplicationVariableId };
  }
}
