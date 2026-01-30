import { type Client } from 'graphql-sse';
import { createState } from 'twenty-ui/utilities';

export const sseClientState = createState<Client | null>({
  key: 'sseClientState',
  defaultValue: null,
});
