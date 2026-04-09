import { gql } from '@apollo/client';

export const REFRESH_ENTERPRISE_VALIDITY_TOKEN = gql`
  mutation RefreshEnterpriseValidityToken {
    refreshEnterpriseValidityToken
  }
`;
