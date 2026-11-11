import { CoreApiClient } from 'twenty-client-sdk/core';

import { listLinkedTeamsUserAadObjectIds } from 'src/features/chat/logic-functions/data/list-linked-teams-user-aad-object-ids';
import { type TeamsUnlinkedUsersResult } from 'src/features/chat/logic-functions/types/teams-user-search-option.type';
import { collectGraphUsers } from 'src/features/chat/logic-functions/utils/collect-graph-users';
import { currentUserHasRolesPermission } from 'src/features/chat/logic-functions/utils/current-user-has-roles-permission';
import { getTeamsWorkspaceGraphAccess } from 'src/features/chat/logic-functions/utils/get-teams-workspace-graph-access';
import { toTeamsGraphUsersErrorMessage } from 'src/features/chat/logic-functions/utils/to-teams-graph-users-error-message';
import { toTeamsUserSearchOption } from 'src/features/chat/logic-functions/utils/to-teams-user-search-option';

const MAX_UNLINKED_RESULTS = 20;
const UNLINKED_USERS_GRAPH_URL =
  'users?$select=id,displayName,mail,userPrincipalName&$top=200';

export const teamsListUnlinkedUsersHandler =
  async (): Promise<TeamsUnlinkedUsersResult> => {
    if (!(await currentUserHasRolesPermission())) {
      return {
        success: false,
        message: 'Not allowed',
        error:
          'Only members with the roles permission can list unlinked Teams users.',
      };
    }

    const graphAccess = await getTeamsWorkspaceGraphAccess();

    if (!graphAccess.success) {
      return {
        success: false,
        message: 'Microsoft Teams is not connected',
        error: graphAccess.error,
      };
    }

    try {
      const linkedAadObjectIds = await listLinkedTeamsUserAadObjectIds({
        client: new CoreApiClient({ runAs: 'application' }),
        teamsTenantId: graphAccess.tenantId,
      });

      const { users, isTruncated } = await collectGraphUsers({
        accessToken: graphAccess.accessToken,
        url: UNLINKED_USERS_GRAPH_URL,
        shouldCollectUser: (user) => !linkedAadObjectIds.has(user.id),
        maxUsers: MAX_UNLINKED_RESULTS,
      });

      return {
        success: true,
        teamsUsers: users.map(toTeamsUserSearchOption),
        hasMore: isTruncated,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Could not list unlinked Teams users',
        error: toTeamsGraphUsersErrorMessage(error),
      };
    }
  };
