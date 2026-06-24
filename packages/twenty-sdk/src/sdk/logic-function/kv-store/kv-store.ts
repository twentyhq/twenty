import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

export type KvSetOptions = {
  ttlInSeconds?: number;
};

const GET_APP_KEY_VALUE_QUERY = `
  query AppKeyValue($key: String!) {
    appKeyValue(key: $key) {
      value
    }
  }
`;

const SET_APP_KEY_VALUE_MUTATION = `
  mutation SetAppKeyValue($input: SetAppKeyValueInput!) {
    setAppKeyValue(input: $input)
  }
`;

const DELETE_APP_KEY_VALUE_MUTATION = `
  mutation DeleteAppKeyValue($key: String!) {
    deleteAppKeyValue(key: $key)
  }
`;

const get = async (key: string): Promise<{ value: string } | null> => {
  const { appKeyValue } = await postGraphqlRequest<
    { key: string },
    { appKeyValue: { value: string } | null }
  >({
    query: GET_APP_KEY_VALUE_QUERY,
    variables: { key },
    caller: 'kv.get',
  });

  return appKeyValue;
};

const set = async (
  key: string,
  value: string,
  options?: KvSetOptions,
): Promise<void> => {
  await postGraphqlRequest<
    { input: { key: string; value: string; ttlInSeconds?: number } },
    { setAppKeyValue: boolean }
  >({
    query: SET_APP_KEY_VALUE_MUTATION,
    variables: {
      input: { key, value, ttlInSeconds: options?.ttlInSeconds },
    },
    caller: 'kv.set',
  });
};

const deleteKey = async (key: string): Promise<void> => {
  await postGraphqlRequest<{ key: string }, { deleteAppKeyValue: boolean }>({
    query: DELETE_APP_KEY_VALUE_MUTATION,
    variables: { key },
    caller: 'kv.delete',
  });
};

// Lightweight, server-side key-value store for logic functions. Mirrors the
// Attio `kv` API (get / set / delete) and is backed by the Twenty server's
// Redis cache, scoped per application per workspace.
export const kv = {
  get,
  set,
  delete: deleteKey,
};
