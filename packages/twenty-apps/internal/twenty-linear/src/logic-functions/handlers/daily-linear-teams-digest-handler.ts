import { listConnections } from 'twenty-sdk/logic-function';

import { callLinearGraphQL } from 'src/logic-functions/utils/call-linear-graphql';

type LinearTeam = {
  id: string;
  name: string;
  key: string;
};

type TeamsQueryResult = {
  teams: { nodes: LinearTeam[] };
};

type HandlerResult =
  | { success: true; teamCount: number; usedConnectionId: string }
  | { success: false; error: string };

// Cron triggers don't carry a user context, so `findConnectionForRequest`
// can't be used. The app picks a connection by:
//   1. preferring a workspace-shared one (set up by an admin),
//   2. falling back to whichever member is referenced by the
//      LINEAR_DEFAULT_USER_WORKSPACE_ID applicationVariable.
// If neither resolves, the cron skips silently — it does not raise.
export const dailyLinearTeamsDigestHandler =
  async (): Promise<HandlerResult> => {
    const connections = await listConnections({ providerName: 'linear' });

    const workspaceConnection = connections.find(
      (connection) => connection.scope === 'workspace',
    );

    const fallbackUserWorkspaceId =
      process.env.LINEAR_DEFAULT_USER_WORKSPACE_ID;

    const fallbackConnection =
      workspaceConnection ??
      (fallbackUserWorkspaceId
        ? connections.find(
            (connection) =>
              connection.userWorkspaceId === fallbackUserWorkspaceId,
          )
        : undefined);

    if (!fallbackConnection) {
      return {
        success: false,
        error:
          'No Linear connection available for the cron job. Add a workspace-shared credential or set LINEAR_DEFAULT_USER_WORKSPACE_ID.',
      };
    }

    const result = await callLinearGraphQL<TeamsQueryResult>({
      accessToken: fallbackConnection.accessToken,
      query: `
      query Teams {
        teams { nodes { id name key } }
      }
    `,
    });

    if (result.errors || !result.data) {
      return {
        success: false,
        error: result.errors?.[0]?.message ?? 'Unknown Linear API error',
      };
    }

    return {
      success: true,
      teamCount: result.data.teams.nodes.length,
      usedConnectionId: fallbackConnection.id,
    };
  };
