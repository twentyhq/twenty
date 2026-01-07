import { type Client } from 'graphql-sse';
import { createContext } from 'react';

export const SseClientContext = createContext<Client | null>(null);
