import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatErrorState = createAtomState<Error | undefined | null>({
  key: 'agentChatErrorState',
  defaultValue: null,
});
