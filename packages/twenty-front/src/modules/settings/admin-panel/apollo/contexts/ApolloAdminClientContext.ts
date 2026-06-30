import { type ApolloClient } from '@apollo/client';
import { createContext } from 'react';

export const ApolloAdminClientContext = createContext<ApolloClient | null>(
  null,
);
