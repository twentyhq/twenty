import { listConnections } from 'twenty-sdk/logic-function';

import { callLinearGraphQL } from 'src/logic-functions/utils/call-linear-graphql';

type LinearWorkflowState = {
  id: string;
  name: string;
  type: string;
  position: number;
};

type WorkflowStatesQueryResult = {
  team: { states: { nodes: LinearWorkflowState[] } };
};

type HandlerResult =
  | { success: true; states: LinearWorkflowState[] }
  | { success: false; error: string };

export const listLinearWorkflowStatesHandler = async (input: {
  teamId?: string;
}): Promise<HandlerResult> => {
  if (!input.teamId) {
    return { success: false, error: '`teamId` is required.' };
  }

  const connections = await listConnections({ providerName: 'linear' });
  const connection =
    connections.find((c) => c.visibility === 'workspace') ?? connections[0];

  if (!connection) {
    return {
      success: false,
      error:
        'Linear is not connected. Open the app settings and click "Add connection" first.',
    };
  }

  const result = await callLinearGraphQL<WorkflowStatesQueryResult>({
    accessToken: connection.accessToken,
    query: `
      query WorkflowStates($teamId: String!) {
        team(id: $teamId) {
          states { nodes { id name type position } }
        }
      }
    `,
    variables: { teamId: input.teamId },
  });

  if (result.errors || !result.data) {
    return {
      success: false,
      error: result.errors?.[0]?.message ?? 'Unknown Linear API error',
    };
  }

  const states = result.data.team.states.nodes.sort(
    (a, b) => a.position - b.position,
  );

  return { success: true, states };
};
