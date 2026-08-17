import { type LogicFunctionCaller } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const buildLogicFunctionCaller = ({
  userId,
  userWorkspaceId,
  workspaceMemberId,
  apiKeyId,
}: {
  userId?: string | null;
  userWorkspaceId?: string | null;
  workspaceMemberId?: string | null;
  apiKeyId?: string | null;
}): LogicFunctionCaller | undefined => {
  if (isDefined(userId) && isDefined(userWorkspaceId)) {
    return {
      kind: 'user',
      userId,
      userWorkspaceId,
      ...(isDefined(workspaceMemberId) ? { workspaceMemberId } : {}),
    };
  }

  if (isDefined(apiKeyId)) {
    return {
      kind: 'apiKey',
      apiKeyId,
    };
  }

  return undefined;
};
