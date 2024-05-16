import { OperationVariables } from '@apollo/client';
import { DocumentNode } from 'graphql';

import getApolloClient from '~/utils/apolloClient';
import { isDefined } from '~/utils/isDefined';

export const callQuery = async <T>(
  query: DocumentNode,
  variables?: OperationVariables,
): Promise<T | null> => {
  try {
    const client = await getApolloClient();
    const { data } = await client.query<T>({ query, variables });

    if (isDefined(data)) return data;
    else return null;
  } catch (error) {
    return null;
  }
};

export const callMutation = async <T>(
  mutation: DocumentNode,
  variables?: OperationVariables,
): Promise<T | null> => {
  try {
    const client = await getApolloClient();

    const { data } = await client.mutate<T>({ mutation, variables });

    if (isDefined(data)) return data;
    else return null;
  } catch (error) {
    return null;
  }
};
