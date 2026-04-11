import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatErrorState = createAtomState<
  Record<string, Error | null>
>({
  key: 'agentChatErrorState',
  defaultValue: {},
});
