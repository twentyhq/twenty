import { gql } from '@apollo/client';

export const FIND_COMPANY = gql`
  query FindCompany($filter: CompanyFilterInput!) {
    companies(filter: $filter) {
      edges {
        node {
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
