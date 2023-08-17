import { gql } from '@apollo/client';

export const INSERT_MANY_COMPANY = gql`
  mutation InsertManyCompany($data: [CompanyCreateManyInput!]!) {
    createManyCompany(data: $data) {
      count
    }
  }
`;
