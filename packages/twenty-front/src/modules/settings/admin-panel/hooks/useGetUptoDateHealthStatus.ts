import { useGetSystemHealthStatusQuery } from '~/generated/graphql';

export const useGetUptoDateHealthStatus = () => {
  const { data, loading } = useGetSystemHealthStatusQuery({
    fetchPolicy: 'network-only',
  });

  return {
    healthStatus: data?.getSystemHealthStatus,
    healthStatusLoading: loading,
  };
};
