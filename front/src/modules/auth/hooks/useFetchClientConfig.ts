import { useGetClientConfigQuery } from '~/generated/graphql';

export function useFetchClientConfig() {
  const { data } = useGetClientConfigQuery();

  return data?.clientConfig;
}