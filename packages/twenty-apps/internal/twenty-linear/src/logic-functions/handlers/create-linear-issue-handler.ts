import { listConnections } from 'twenty-sdk/logic-function';

import { ISSUE_CREATE_MUTATION } from 'src/logic-functions/constants/issue-create-mutation.constant';
import { type CreateIssueInput } from 'src/logic-functions/types/create-issue-input.type';
import { type CreateIssueMutationResult } from 'src/logic-functions/types/create-issue-mutation-result.type';
import { callLinearGraphQL } from 'src/logic-functions/utils/call-linear-graphql';

type HandlerResult =
  | {
      success: true;
      issue: {
        id: string;
        identifier: string;
        title: string;
        url: string;
      };
    }
  | { success: false; error: string };

export const createLinearIssueHandler = async (
  input: CreateIssueInput,
): Promise<HandlerResult> => {
  if (!input.teamId || !input.title) {
    return {
      success: false,
      error: 'Both `teamId` and `title` are required.',
    };
  }

  const connections = await listConnections({ providerName: 'linear' });
  // Workspace-shared credentials win when present (a team-managed service
  // account); otherwise fall back to the first user-scoped connection.
  const connection =
    connections.find((c) => c.visibility === 'workspace') ?? connections[0];

  if (!connection) {
    return {
      success: false,
      error:
        'Linear is not connected. Open the app settings and click "Add connection" first.',
    };
  }

  const result = await callLinearGraphQL<CreateIssueMutationResult>({
    accessToken: connection.accessToken,
    query: ISSUE_CREATE_MUTATION,
    variables: {
      input: {
        teamId: input.teamId,
        title: input.title,
        description: input.description,
      },
    },
  });

  if (result.errors || !result.data) {
    return {
      success: false,
      error: result.errors?.[0]?.message ?? 'Unknown Linear API error',
    };
  }

  const { success, issue } = result.data.issueCreate;

  if (!success || !issue) {
    return {
      success: false,
      error: 'Linear reported the mutation as unsuccessful.',
    };
  }

  return { success: true, issue };
};
