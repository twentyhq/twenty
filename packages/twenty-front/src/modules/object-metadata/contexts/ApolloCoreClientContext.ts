import { createContext } from 'react';
import { type ApolloClient } from '@apollo/client';

export const ApolloCoreClientContext =
  createContext<ApolloClient | null>(null);
