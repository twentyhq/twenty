import { GET_ALL_ISSUERS_BY_WORKSPACE } from '@/settings/integrations/focus-nfe/graphql/get-all-issuers-by-workspace.gql';
import { useQuery } from '@apollo/client';
import { Issuer } from '~/types/Issuer';

interface GetIssuersQueryData {
  getIssuersByWorkspace: Issuer[];
}

export const useGetAllIssuersByWorkspace = () => {
  const {
    data,
    loading,
    error,
    refetch: refetchIssuers,
  } = useQuery<GetIssuersQueryData>(GET_ALL_ISSUERS_BY_WORKSPACE, {
    fetchPolicy: 'network-only',
  });

  return {
    issuers: data?.getIssuersByWorkspace || [],
    loading,
    error,
    refetchIssuers,
  };
};
