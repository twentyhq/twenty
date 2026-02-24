import { type Client } from 'graphql-sse';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const sseClientState = createState<Client | null>({
  key: 'sseClientState',
  defaultValue: null,
});
