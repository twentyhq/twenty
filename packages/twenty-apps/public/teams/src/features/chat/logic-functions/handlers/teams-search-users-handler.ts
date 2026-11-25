import { isNonEmptyString } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';

import { type TeamsUserSearchResult } from 'src/features/chat/logic-functions/types/teams-user-search-option.type';
import { buildTeamsUserSearchUrl } from 'src/features/chat/logic-functions/utils/build-teams-user-search-url';
import { collectGraphUsers } from 'src/features/chat/logic-functions/utils/collect-graph-users';
import { currentUserHasRolesPermission } from 'src/features/chat/logic-functions/utils/current-user-has-roles-permission';
import { getTeamsWorkspaceGraphAccess } from 'src/features/chat/logic-functions/utils/get-teams-workspace-graph-access';
import { toTeamsGraphUsersErrorMessage } from 'src/features/chat/logic-functions/utils/to-teams-graph-users-error-message';
import { toTeamsUserSearchOption } from 'src/features/chat/logic-functions/utils/to-teams-user-search-option';

const MAX_RESULTS = 10;

export const teamsSearchUsersHandler = async (
  payload: Pick<RoutePayload<{ query?: unknown }>, 'body'>,
): Promise<TeamsUserSearchResult> => {
  if (!(await currentUserHasRolesPermission())) {
    return {
      success: false,
      message: 'Not allowed',
      error: 'Only members with the roles permission can search Teams users.',
    };
  }

  const query = isNonEmptyString(payload.body?.query)
    ? payload.body.query.trim()
    : '';

  if (!isNonEmptyString(query)) {
    return { success: true, teamsUsers: [] };
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
    const { users } = await collectGraphUsers({
      accessToken: graphAccess.accessToken,
      url: buildTeamsUserSearchUrl({ query, top: MAX_RESULTS }),
      maxUsers: MAX_RESULTS,
      maxPages: 1,
    });

    return {
      success: true,
      teamsUsers: users.map(toTeamsUserSearchOption),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Could not search Teams users',
      error: toTeamsGraphUsersErrorMessage(error),
    };
  }
};
