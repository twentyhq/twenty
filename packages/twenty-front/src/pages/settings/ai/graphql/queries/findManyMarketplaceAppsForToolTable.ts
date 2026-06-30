import { gql } from '@apollo/client';

export const FIND_MANY_MARKETPLACE_APPS_FOR_TOOL_TABLE = gql`
  query FindManyMarketplaceAppsForToolTable {
    findManyMarketplaceApps {
      id
      logo
    }
  }
`;
