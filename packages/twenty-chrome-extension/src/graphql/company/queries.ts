import { gql } from '@apollo/client';

export const FIND_COMPANY = gql`
  query FindCompany($filter: CompanyFilterInput!) {
    companies(filter: $filter) {
      edges {
        node {
          id
          name
          linkedinLink {
            url
            label
          }
        }
      }
    }
  }
`;
