import { createContext } from 'react';
import { type ApolloClient, type NormalizedCacheObject } from '@apollo/client';

export const ApolloCoreClientContext =
  createContext<ApolloClient<NormalizedCacheObject> | null>(null);
