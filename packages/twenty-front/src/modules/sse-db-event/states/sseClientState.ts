import { type Client } from 'graphql-sse';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sseClientState = createAtomState<Client | null>({
  key: 'sseClientState',
  defaultValue: null,
});
