import { type LogicFunctionCaller } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

type ApplicationCallerIdentity = {
  userWorkspaceId?: string;
  apiKeyId?: string;
};

export const resolveApplicationCallerIdentity = ({
  caller,
  tokenUserWorkspaceId,
}: {
  caller?: LogicFunctionCaller;
  tokenUserWorkspaceId?: string;
}): ApplicationCallerIdentity | undefined => {
  if (caller?.type === 'user') {
    return { userWorkspaceId: caller.userWorkspaceId };
  }

  if (caller?.type === 'apiKey') {
    return { apiKeyId: caller.apiKeyId };
  }

  // A token minted for a signed-in user (front components, authenticated route
  // triggers) identifies its own caller without carrying a dedicated claim.
  return isDefined(tokenUserWorkspaceId)
    ? { userWorkspaceId: tokenUserWorkspaceId }
    : undefined;
};
