import { type LogicFunctionInvokingUser } from 'twenty-shared/application';

export const resolveInvokingUserWorkspaceId = ({
  invokingUser,
  tokenUserWorkspaceId,
}: {
  invokingUser?: LogicFunctionInvokingUser;
  tokenUserWorkspaceId?: string;
}): string | undefined => invokingUser?.userWorkspaceId ?? tokenUserWorkspaceId;
