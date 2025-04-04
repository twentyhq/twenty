import { createContext } from 'react';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export const ApolloSubscriptionClientContext =
  createContext<ApolloClient<NormalizedCacheObject> | null>(null);
