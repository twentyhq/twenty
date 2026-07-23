import { gql } from '@apollo/client';

export const ENRICH_WORKSPACE_COMPANY = gql`
  mutation EnrichWorkspaceCompany {
    enrichWorkspaceCompany {
      outcome
      enrichment
    }
  }
`;
