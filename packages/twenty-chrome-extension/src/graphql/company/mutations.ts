import { gql } from '@apollo/client';

export const CREATE_COMPANY = gql`
  mutation CreateOneCompany($input: CompanyCreateInput!) {
    createCompany(data: $input) {
      id
    }
  }
`;
