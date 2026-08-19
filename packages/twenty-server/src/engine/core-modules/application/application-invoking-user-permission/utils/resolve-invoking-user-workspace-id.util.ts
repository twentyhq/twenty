import { type LogicFunctionInvokingUser } from 'twenty-shared/application';

// A token minted for a signed-in user (front components, authenticated route
// triggers) identifies its own invoking user without carrying a dedicated claim.
export const resolveInvokingUserWorkspaceId = ({
  invokingUser,
  tokenUserWorkspaceId,
}: {
  invokingUser?: LogicFunctionInvokingUser;
  tokenUserWorkspaceId?: string;
}): string | undefined =>
  invokingUser?.userWorkspaceId ?? tokenUserWorkspaceId;
