import { gql } from '@apollo/client';

export const SET_ENTERPRISE_KEY = gql`
  mutation SetEnterpriseKey($enterpriseKey: String!) {
    setEnterpriseKey(enterpriseKey: $enterpriseKey) {
      isValid
      licensee
      expiresAt
      subscriptionId
    }
  }
`;
