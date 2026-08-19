import { type PermissionFlagType } from 'twenty-shared/constants';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const INVOKING_USER_HAS_PERMISSION_FLAG_QUERY = `
  query InvokingUserHasPermissionFlag($permissionFlag: PermissionFlagType!) {
    invokingUserHasPermissionFlag(permissionFlag: $permissionFlag)
  }
`;

export const invokingUserHasPermissionFlag = async (
  permissionFlag: PermissionFlagType | `${PermissionFlagType}`,
): Promise<boolean> => {
  const { invokingUserHasPermissionFlag: userHasPermissionFlag } =
    await postGraphqlRequest<
      { permissionFlag: string },
      { invokingUserHasPermissionFlag: boolean }
    >({
      query: INVOKING_USER_HAS_PERMISSION_FLAG_QUERY,
      variables: { permissionFlag },
      caller: 'invokingUserHasPermissionFlag',
    });

  return userHasPermissionFlag;
};
