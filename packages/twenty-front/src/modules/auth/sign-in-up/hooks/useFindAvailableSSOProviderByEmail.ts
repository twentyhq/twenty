import { useFindAvailableSSOProviderByEmailMutation } from '~/generated/graphql';

export const useFindAvailableSSOProviderByEmail = () => {
  const [findAvailableSSOProviderByEmailMutation] =
    useFindAvailableSSOProviderByEmailMutation();

  const findAvailableSSOProviderByEmail = async ({
    email,
  }: FindAvailableSSOProviderByEmailMutationVariables) => {
    return await findAvailableSSOProviderByEmailMutation({
      variables: {
        email,
      },
    });
  };

  return {
    findAvailableSSOProviderByEmail,
  };
};
