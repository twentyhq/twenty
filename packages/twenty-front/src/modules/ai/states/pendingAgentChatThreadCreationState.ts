import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const pendingAgentChatThreadCreationState = createAtomState<Promise<
  string | null
> | null>({
  key: 'ai/pendingAgentChatThreadCreationState',
  defaultValue: null,
});
