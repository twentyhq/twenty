import { useFindAvailableWorkspacesByEmailLazyQuery } from '~/generated/graphql';

export const useFindAvailableWorkspacesByEmail = () => {
  const [findAvailableWorkspacesByEmailQuery] =
    useFindAvailableWorkspacesByEmailLazyQuery();

  const findAvailableWorkspacesByEmail = async (email: string) => {
    return await findAvailableWorkspacesByEmailQuery({
      variables: {
        email,
      },
    });
  };

  return {
    findAvailableWorkspacesByEmail,
  };
};
