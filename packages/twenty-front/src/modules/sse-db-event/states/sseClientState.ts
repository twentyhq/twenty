import { type Client } from 'graphql-sse';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const sseClientState = createStateV2<Client | null>({
  key: 'sseClientState',
  defaultValue: null,
});
