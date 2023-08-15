import { gql } from '@apollo/client';

export const DELETE_MANY_COMPANIES = gql`
  mutation DeleteManyCompanies($ids: [String!]) {
    deleteManyCompany(where: { id: { in: $ids } }) {
      count
    }
  }
`;
