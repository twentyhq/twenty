import { type PermissionFlagType } from 'twenty-shared/constants';

import { getCaller } from '@/sdk/logic-function/caller/get-caller';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const APP_CALLER_HAS_PERMISSION_FLAG_QUERY = `
  query AppCallerHasPermissionFlag(
    $permissionFlag: PermissionFlagType!
    $userWorkspaceId: String
    $apiKeyId: String
  ) {
    appCallerHasPermissionFlag(
      permissionFlag: $permissionFlag
      userWorkspaceId: $userWorkspaceId
      apiKeyId: $apiKeyId
    )
  }
`;

export const callerHasPermissionFlag = async (
  permissionFlag: PermissionFlagType | `${PermissionFlagType}`,
): Promise<boolean> => {
  const caller = getCaller();

  if (caller === null) {
    return false;
  }

  const { appCallerHasPermissionFlag } = await postGraphqlRequest<
    {
      permissionFlag: string;
      userWorkspaceId?: string;
      apiKeyId?: string;
    },
    { appCallerHasPermissionFlag: boolean }
  >({
    query: APP_CALLER_HAS_PERMISSION_FLAG_QUERY,
    variables: {
      permissionFlag,
      ...(caller.kind === 'user'
        ? { userWorkspaceId: caller.userWorkspaceId }
        : { apiKeyId: caller.apiKeyId }),
    },
    caller: 'callerHasPermissionFlag',
  });

  return appCallerHasPermissionFlag;
};
