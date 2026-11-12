import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatThreadLastUpdateCountByIdState = createAtomState<
  Record<string, number>
>({
  key: 'agentChatThreadLastUpdateCountByIdState',
  defaultValue: {},
});
