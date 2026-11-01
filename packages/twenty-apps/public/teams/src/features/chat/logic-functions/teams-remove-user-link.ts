import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { TEAMS_USER_LINKS_REMOVE_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import { TEAMS_REMOVE_USER_LINK_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { destroyTeamsUserLink } from 'src/features/chat/logic-functions/data/destroy-teams-user-link';
import { type TeamsUserLinkActionResult } from 'src/features/chat/logic-functions/types/teams-user-link-action-result.type';
import { currentUserHasRolesPermission } from 'src/features/chat/logic-functions/utils/current-user-has-roles-permission';
import { toErrorMessage } from 'src/utils/to-error-message';

export const teamsRemoveUserLinkHandler = async (
  payload: Pick<RoutePayload<{ id?: unknown }>, 'body'>,
): Promise<TeamsUserLinkActionResult> => {
  const id = payload.body?.id;

  if (!isNonEmptyString(id)) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'id is required.',
    };
  }

  if (!(await currentUserHasRolesPermission())) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the roles permission can remove Teams user links.',
    };
  }

  try {
    await destroyTeamsUserLink({
      client: new CoreApiClient({ runAs: 'application' }),
      id,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not remove the link',
      error: toErrorMessage(error),
    };
  }

  return { success: true, message: 'Removed the Teams user link.' };
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_REMOVE_USER_LINK_UNIVERSAL_IDENTIFIER,
  name: 'teams-remove-user-link',
  description:
    'Removes a Teams user link. The account then falls back to email matching on its next message, so this undoes a manual link or clears a stale one. Restricted to members with the roles permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: TEAMS_USER_LINKS_REMOVE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: teamsRemoveUserLinkHandler,
});
