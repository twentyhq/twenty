import { gql } from '@apollo/client';

export const INSERT_ONE_COMPANY = gql`
  mutation InsertOneCompany($data: CompanyCreateInput!) {
    createOneCompany(data: $data) {
      ...companyFieldsFragment
    }
  }
`;
