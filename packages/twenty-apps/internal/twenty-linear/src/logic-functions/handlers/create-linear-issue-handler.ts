import {
  OAuthNotConnectedError,
  type RoutePayload,
  useOAuth,
} from 'twenty-sdk/logic-function';

import { ISSUE_CREATE_MUTATION } from 'src/logic-functions/constants/issue-create-mutation.constant';
import { type CreateIssueBody } from 'src/logic-functions/types/create-issue-body.type';
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
  event: RoutePayload<CreateIssueBody>,
): Promise<HandlerResult> => {
  const body = event.body ?? {};

  if (!body.teamId || !body.title) {
    return {
      success: false,
      error: 'Both `teamId` and `title` are required in the request body.',
    };
  }

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

  const result = await callLinearGraphQL<CreateIssueMutationResult>({
    accessToken,
    query: ISSUE_CREATE_MUTATION,
    variables: {
      input: {
        teamId: body.teamId,
        title: body.title,
        description: body.description,
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
