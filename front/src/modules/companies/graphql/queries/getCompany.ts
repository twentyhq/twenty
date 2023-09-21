import { gql } from '@apollo/client';

export const GET_COMPANY = gql`
  query GetCompany($where: CompanyWhereUniqueInput!) {
    findUniqueCompany(where: $where) {
      ...companyFieldsFragment
      Favorite {
        id
        person {
          id
        }
        company {
          id
        }
      }
    }
  }
`;
