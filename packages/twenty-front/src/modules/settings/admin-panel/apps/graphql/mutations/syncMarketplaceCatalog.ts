import { gql } from '@apollo/client';

export const SYNC_MARKETPLACE_CATALOG = gql`
  mutation SyncMarketplaceCatalog {
    syncMarketplaceCatalog
  }
`;
