import { type LogicFunctionTriggeredBy } from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const LOGIC_FUNCTION_TRIGGERED_BY_QUERY = `
  query LogicFunctionTriggeredBy {
    logicFunctionTriggeredBy {
      userId
      userWorkspaceId
      workspaceMemberId
      permissionFlags
    }
  }
`;

export const getTriggeredBy =
  async (): Promise<LogicFunctionTriggeredBy | null> => {
    const { logicFunctionTriggeredBy } = await postGraphqlRequest<
      Record<string, never>,
      { logicFunctionTriggeredBy: LogicFunctionTriggeredBy | null }
    >({
      query: LOGIC_FUNCTION_TRIGGERED_BY_QUERY,
      variables: {},
      caller: 'getTriggeredBy',
    });

    return logicFunctionTriggeredBy;
  };
