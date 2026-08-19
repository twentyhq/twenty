import { type LogicFunctionInvokingUser } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const buildLogicFunctionInvokingUser = ({
  userId,
  userWorkspaceId,
}: {
  userId?: string | null;
  userWorkspaceId?: string | null;
}): LogicFunctionInvokingUser | undefined => {
  if (!isDefined(userId) || !isDefined(userWorkspaceId)) {
    return undefined;
  }

  return { userId, userWorkspaceId };
};
