import { getWorkspaceApplicationVariablesCompleteness } from '@/settings/applications/utils/getWorkspaceApplicationVariablesCompleteness';
import { type ApolloClient } from '@apollo/client';
import { type FindOneApplicationQuery } from '~/generated-metadata/graphql';

export const useRefetchWorkspaceApplicationVariables = ({
  refetchApplication,
}: {
  refetchApplication: () => Promise<
    ApolloClient.QueryResult<FindOneApplicationQuery>
  >;
}) => {
  const refetchApplicationVariables = async () => {
    const { data } = await refetchApplication();

    return getWorkspaceApplicationVariablesCompleteness(
      data?.findOneApplication?.applicationVariables,
    );
  };

  return { refetchApplicationVariables };
};
