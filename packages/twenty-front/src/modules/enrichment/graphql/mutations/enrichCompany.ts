import { gql } from '@apollo/client';

export const ENRICH_COMPANY = gql`
  mutation EnrichCompany($input: EnrichCompanyInput!) {
    enrichCompany(input: $input) {
      success
      description
      sources {
        name
        url
        snippet
      }
      error
    }
  }
`;
