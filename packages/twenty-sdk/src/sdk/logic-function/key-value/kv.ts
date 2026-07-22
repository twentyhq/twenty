import {
  type AppKeyValue,
  type AppKeyValueScope,
} from 'twenty-shared/application';

import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const GET_APP_KEY_VALUE_QUERY = `
  query GetAppKeyValue($key: String!, $scope: AppKeyValueScope) {
    appKeyValue(key: $key, scope: $scope) {
      key
      value
      scope
    }
  }
`;

const SET_APP_KEY_VALUE_MUTATION = `
  mutation SetAppKeyValue($input: SetAppKeyValueInput!) {
    setAppKeyValue(input: $input) {
      key
      value
      scope
    }
  }
`;

const DELETE_APP_KEY_VALUE_MUTATION = `
  mutation DeleteAppKeyValue($key: String!, $scope: AppKeyValueScope) {
    deleteAppKeyValue(key: $key, scope: $scope)
  }
`;

const DEFAULT_APP_KEY_VALUE_SCOPE: AppKeyValueScope = 'WORKSPACE';

type KvOptions = {
  scope?: AppKeyValueScope;
};

export const kv = {
  async get<TValue = unknown>(
    key: string,
    options?: KvOptions,
  ): Promise<TValue | null> {
    const { appKeyValue } = await postGraphqlRequest<
      { key: string; scope: AppKeyValueScope },
      { appKeyValue: AppKeyValue | null }
    >({
      query: GET_APP_KEY_VALUE_QUERY,
      variables: { key, scope: options?.scope ?? DEFAULT_APP_KEY_VALUE_SCOPE },
      caller: 'kv.get',
    });

    return (appKeyValue?.value ?? null) as TValue | null;
  },

  async set<TValue>(
    key: string,
    value: TValue,
    options?: KvOptions,
  ): Promise<void> {
    await postGraphqlRequest<
      {
        input: { key: string; value: TValue; scope: AppKeyValueScope };
      },
      { setAppKeyValue: AppKeyValue }
    >({
      query: SET_APP_KEY_VALUE_MUTATION,
      variables: {
        input: {
          key,
          value,
          scope: options?.scope ?? DEFAULT_APP_KEY_VALUE_SCOPE,
        },
      },
      caller: 'kv.set',
    });
  },

  async delete(key: string, options?: KvOptions): Promise<boolean> {
    const { deleteAppKeyValue } = await postGraphqlRequest<
      { key: string; scope: AppKeyValueScope },
      { deleteAppKeyValue: boolean }
    >({
      query: DELETE_APP_KEY_VALUE_MUTATION,
      variables: { key, scope: options?.scope ?? DEFAULT_APP_KEY_VALUE_SCOPE },
      caller: 'kv.delete',
    });

    return deleteAppKeyValue;
  },
};
