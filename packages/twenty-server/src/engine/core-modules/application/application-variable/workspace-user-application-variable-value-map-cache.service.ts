import { Injectable } from '@nestjs/common';

import { type UserApplicationVariableValueMaps } from 'src/engine/core-modules/application/application-variable/types/user-application-variable-value-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const USER_APPLICATION_VARIABLE_VALUE_ROWS_REQUIREMENT = {
  userApplicationVariableValue: [
    'applicationVariableId',
    'userWorkspaceId',
    'value',
  ],
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('userApplicationVariableValueMaps', {
  packingPonderation: 1,
  bypassMemoizer: true,
})
export class WorkspaceUserApplicationVariableValueMapCacheService extends WorkspaceCacheProvider<UserApplicationVariableValueMaps> {
  override readonly rowsRequirement =
    USER_APPLICATION_VARIABLE_VALUE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof USER_APPLICATION_VARIABLE_VALUE_ROWS_REQUIREMENT
  >): UserApplicationVariableValueMaps {
    const byApplicationVariableId: UserApplicationVariableValueMaps['byApplicationVariableId'] =
      {};

    for (const {
      applicationVariableId,
      userWorkspaceId,
      value,
    } of rows.userApplicationVariableValue) {
      const valuesByUserWorkspaceId = (byApplicationVariableId[
        applicationVariableId
      ] ??= {});

      valuesByUserWorkspaceId[userWorkspaceId] = value;
    }

    return { byApplicationVariableId };
  }
}
