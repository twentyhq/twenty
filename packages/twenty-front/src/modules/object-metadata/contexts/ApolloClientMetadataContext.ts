import { createContext } from 'react';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export const ApolloMetadataClientContext =
  createContext<ApolloClient<NormalizedCacheObject> | null>(null);
