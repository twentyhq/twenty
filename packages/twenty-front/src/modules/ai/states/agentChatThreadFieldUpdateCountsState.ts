import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadFieldUpdateCountsState = createAtomState<
  Record<string, Record<string, number>>
>({
  key: 'agentChatThreadFieldUpdateCountsState',
  defaultValue: {},
});
