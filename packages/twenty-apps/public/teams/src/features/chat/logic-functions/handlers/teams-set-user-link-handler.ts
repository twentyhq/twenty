import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { doesWorkspaceMemberExist } from 'src/features/chat/logic-functions/data/does-workspace-member-exist';
import { findTeamsUserLink } from 'src/features/chat/logic-functions/data/find-teams-user-link';
import { type TeamsUserLink } from 'src/features/chat/logic-functions/types/teams-user-link.type';
import { type TeamsUserLinkActionResult } from 'src/features/chat/logic-functions/types/teams-user-link-action-result.type';
import { currentUserHasRolesPermission } from 'src/features/chat/logic-functions/utils/current-user-has-roles-permission';
import {
  extractTeamsSetUserLinkInput,
  type TeamsSetUserLinkPayload,
} from 'src/features/chat/logic-functions/utils/extract-teams-set-user-link-input';
import { getTeamsWorkspaceGraphAccess } from 'src/features/chat/logic-functions/utils/get-teams-workspace-graph-access';
import { persistTeamsUserLink } from 'src/features/chat/logic-functions/utils/persist-teams-user-link';
import { toErrorMessage } from 'src/utils/to-error-message';

export const teamsSetUserLinkHandler = async (
  payload: TeamsSetUserLinkPayload,
): Promise<TeamsUserLinkActionResult> => {
  const { workspaceMemberId, teamsUserAadObjectId, name } =
    extractTeamsSetUserLinkInput(payload);

  if (
    !isNonEmptyString(workspaceMemberId) ||
    !isNonEmptyString(teamsUserAadObjectId)
  ) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'workspaceMemberId and teamsUserAadObjectId are required.',
    };
  }

  if (!(await currentUserHasRolesPermission())) {
    return {
      success: false,
      message: 'Not allowed',
      error: 'Only members with the roles permission can set Teams user links.',
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

  const client = new CoreApiClient({ runAs: 'application' });

  let memberExists: boolean;

  try {
    memberExists = await doesWorkspaceMemberExist({
      client,
      workspaceMemberId,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not verify the workspace member',
      error: toErrorMessage(error),
    };
  }

  if (!memberExists) {
    return {
      success: false,
      message: 'Workspace member not found',
      error: `No workspace member with id ${workspaceMemberId}. Check the id and try again.`,
    };
  }

  let existingLink: TeamsUserLink | undefined;

  try {
    existingLink = await findTeamsUserLink({
      client,
      teamsTenantId: graphAccess.tenantId,
      teamsUserAadObjectId,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not look up the existing link',
      error: toErrorMessage(error),
    };
  }

  try {
    await persistTeamsUserLink({
      client,
      existingLink,
      teamsTenantId: graphAccess.tenantId,
      teamsUserAadObjectId,
      workspaceMemberId,
      name,
    });
  } catch (error) {
    return {
      success: false,
      message: 'Could not save the link',
      error: toErrorMessage(error),
    };
  }

  return {
    success: true,
    message: `Linked Teams user to workspace member ${workspaceMemberId}.`,
  };
};
