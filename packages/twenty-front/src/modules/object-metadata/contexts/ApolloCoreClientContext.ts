import { createContext } from 'react';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export const ApolloCoreClientContext =
  createContext<ApolloClient<NormalizedCacheObject> | null>(null);
