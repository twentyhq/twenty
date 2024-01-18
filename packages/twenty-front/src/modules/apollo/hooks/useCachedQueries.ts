import { useApolloClient } from '@apollo/client';
import { DocumentNode } from 'graphql';

export const useCachedQueries = () => {
  const apolloClient = useApolloClient();

  const readQuery = ({
    query,
    variables,
  }: {
    query: DocumentNode;
    variables?: Record<string, any>;
  }) => {
    return apolloClient.readQuery({
      query,
      variables,
    });
  };

  const writeQuery = ({
    query,
    variables,
    data,
  }: {
    query: DocumentNode;
    variables?: Record<string, any>;
    data: any;
  }) => {
    console.log(query);
    apolloClient.writeQuery({
      query,
      variables,
      data,
    });
  };

  return {
    readQuery,
    writeQuery,
  };
};
