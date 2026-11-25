import { type TeamsDirectoryMatchResult } from 'src/features/chat/logic-functions/types/teams-directory-match.type';
import { buildTeamsDirectoryMatchMessage } from 'src/features/chat/logic-functions/utils/build-teams-directory-match-message';
import { currentUserHasRolesPermission } from 'src/features/chat/logic-functions/utils/current-user-has-roles-permission';
import { getTeamsWorkspaceGraphAccess } from 'src/features/chat/logic-functions/utils/get-teams-workspace-graph-access';
import { isTeamsChatEnabled } from 'src/features/chat/logic-functions/utils/is-teams-chat-enabled';
import { matchTeamsDirectoryByEmail } from 'src/features/chat/logic-functions/utils/match-teams-directory-by-email';
import { toTeamsGraphUsersErrorMessage } from 'src/features/chat/logic-functions/utils/to-teams-graph-users-error-message';

export const teamsMatchUserLinksHandler =
  async (): Promise<TeamsDirectoryMatchResult> => {
    if (!isTeamsChatEnabled()) {
      return {
        success: false,
        message: 'Chat is disabled',
        error:
          'Enable chat in the Teams app settings before matching Teams users.',
      };
    }

    if (!(await currentUserHasRolesPermission())) {
      return {
        success: false,
        message: 'Not allowed',
        error:
          'Only members with the roles permission can match Teams users to workspace members.',
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
      const summary = await matchTeamsDirectoryByEmail({
        accessToken: graphAccess.accessToken,
        teamsTenantId: graphAccess.tenantId,
      });

      return {
        success: true,
        message: buildTeamsDirectoryMatchMessage(summary),
        ...summary,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Could not match Teams users',
        error: toTeamsGraphUsersErrorMessage(error),
      };
    }
  };
