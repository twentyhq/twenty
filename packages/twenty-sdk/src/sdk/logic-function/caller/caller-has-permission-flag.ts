import { type PermissionFlagType } from 'twenty-shared/constants';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const APP_CALLER_HAS_PERMISSION_FLAG_QUERY = `
  query AppCallerHasPermissionFlag($permissionFlag: PermissionFlagType!) {
    appCallerHasPermissionFlag(permissionFlag: $permissionFlag)
  }
`;

export const callerHasPermissionFlag = async (
  permissionFlag: PermissionFlagType | `${PermissionFlagType}`,
): Promise<boolean> => {
  const { appCallerHasPermissionFlag } = await postGraphqlRequest<
    { permissionFlag: string },
    { appCallerHasPermissionFlag: boolean }
  >({
    query: APP_CALLER_HAS_PERMISSION_FLAG_QUERY,
    variables: { permissionFlag },
    caller: 'callerHasPermissionFlag',
  });

  return appCallerHasPermissionFlag;
};
