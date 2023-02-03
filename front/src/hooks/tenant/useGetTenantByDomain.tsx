import { ApolloError, useQuery } from '@apollo/client';
import { gql } from 'graphql-tag';
import { Tenant } from '../../interfaces/tenant.interface';

const GET_TENANT_BY_DOMAIN = gql`
  query GetTenantByDomain($domain: String!) {
    tenants(where: { domain: { _eq: $domain } }, limit: 1) {
      auth0_client_id
      domain
    }
  }
`;

type TenantResult = {
  loading: boolean;
  error?: ApolloError;
  tenant?: Tenant;
};

export const useGetTenantByDomain = (): TenantResult => {
  const domain = window.location.hostname;
  const { loading, error, data } = useQuery(GET_TENANT_BY_DOMAIN, {
    variables: { domain },
    context: {
      headers: {
        'x-hasura-default-role': 'public',
      },
    },
  });
  return { loading, error, tenant: data?.tenants[0] };
};
