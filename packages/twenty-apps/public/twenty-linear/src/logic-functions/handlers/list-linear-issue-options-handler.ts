import { listConnections } from 'twenty-sdk/logic-function';

import { callLinearGraphQL } from 'src/logic-functions/utils/call-linear-graphql';

type LinearMember = {
  id: string;
  name: string;
  displayName: string;
};

type LinearProject = {
  id: string;
  name: string;
};

type LinearLabel = {
  id: string;
  name: string;
  color: string;
};

type LinearCycle = {
  id: string;
  name: string | null;
  number: number;
  startsAt: string;
  endsAt: string;
};

type LinearWorkflowState = {
  id: string;
  name: string;
  type: string;
  position: number;
};

type IssueOptionsQueryResult = {
  team: {
    states: { nodes: LinearWorkflowState[] };
    members: { nodes: LinearMember[] };
    cycles: { nodes: LinearCycle[] };
    issueEstimationType: string;
    issueEstimationAllowZero: boolean;
  };
  projects: { nodes: LinearProject[] };
  issueLabels: { nodes: LinearLabel[] };
};

type IssueOptions = {
  states: LinearWorkflowState[];
  members: LinearMember[];
  projects: LinearProject[];
  labels: LinearLabel[];
  cycles: LinearCycle[];
  estimationType: string;
  estimationAllowZero: boolean;
};

type HandlerResult =
  | { success: true; options: IssueOptions }
  | { success: false; error: string };

export const listLinearIssueOptionsHandler = async (input: {
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

  const result = await callLinearGraphQL<IssueOptionsQueryResult>({
    accessToken: connection.accessToken,
    query: `
      query IssueOptions($teamId: String!) {
        team(id: $teamId) {
          states { nodes { id name type position } }
          members { nodes { id name displayName } }
          cycles { nodes { id name number startsAt endsAt } }
          issueEstimationType
          issueEstimationAllowZero
        }
        projects { nodes { id name } }
        issueLabels { nodes { id name color } }
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

  const { team, projects, issueLabels } = result.data;

  const now = new Date().toISOString();
  const activeCycles = team.cycles.nodes.filter((c) => c.endsAt >= now);

  return {
    success: true,
    options: {
      states: team.states.nodes.sort((a, b) => a.position - b.position),
      members: team.members.nodes.sort((a, b) =>
        a.displayName.localeCompare(b.displayName),
      ),
      projects: projects.nodes.sort((a, b) => a.name.localeCompare(b.name)),
      labels: issueLabels.nodes.sort((a, b) => a.name.localeCompare(b.name)),
      cycles: activeCycles.sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      ),
      estimationType: team.issueEstimationType,
      estimationAllowZero: team.issueEstimationAllowZero,
    },
  };
};
