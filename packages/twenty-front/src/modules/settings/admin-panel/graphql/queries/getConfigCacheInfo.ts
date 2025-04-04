import { gql } from '@apollo/client';

export const GET_CONFIG_CACHE_INFO = gql`
  query ConfigCacheInfo {
    configCacheInfo
  }
`;
