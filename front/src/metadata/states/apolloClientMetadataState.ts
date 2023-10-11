import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { atom } from 'recoil';

export const apolloClientMetadataState =
  atom<ApolloClient<NormalizedCacheObject> | null>({
    key: 'apolloClientMetadataState',
    default: null,
  });
