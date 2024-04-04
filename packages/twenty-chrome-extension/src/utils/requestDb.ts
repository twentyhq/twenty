import { OperationVariables } from '@apollo/client';
import { isUndefined } from '@sniptt/guards';
import { DocumentNode } from 'graphql';

import getApolloClient from '~/utils/apolloClient';

export const callQuery = async <T>(
  query: DocumentNode,
  variables?: OperationVariables,
): Promise<T | null> => {
  const client = await getApolloClient();

  const { data, error } = await client.query<T>({ query, variables });

  if (!isUndefined(error)) throw new Error(error.message);

  return data ?? null;
};

export const callMutation = async <T>(
  mutation: DocumentNode,
  variables?: OperationVariables,
): Promise<T | null> => {
  const client = await getApolloClient();

  const { data, errors } = await client.mutate<T>({ mutation, variables });

  if (!isUndefined(errors)) throw new Error(errors[0].message);

  return data ?? null;
};
