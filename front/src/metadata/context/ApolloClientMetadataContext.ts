import { createContext } from 'react';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export const ApolloClientMetadataContext =
  createContext<ApolloClient<NormalizedCacheObject> | null>(null);
