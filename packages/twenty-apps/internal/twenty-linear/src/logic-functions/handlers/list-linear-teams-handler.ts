import { OAuthNotConnectedError, useOAuth } from 'twenty-sdk/logic-function';

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
  | { success: true; teams: LinearTeam[] }
  | { success: false; error: string };

export const listLinearTeamsHandler = async (): Promise<HandlerResult> => {
  let accessToken: string;

  try {
    accessToken = useOAuth('linear').accessToken;
  } catch (error) {
    if (error instanceof OAuthNotConnectedError) {
      return {
        success: false,
        error:
          'Linear is not connected. Open the app settings and click "Connect Linear" first.',
      };
    }
    throw error;
  }

  const result = await callLinearGraphQL<TeamsQueryResult>({
    accessToken,
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

  return { success: true, teams: result.data.teams.nodes };
};
