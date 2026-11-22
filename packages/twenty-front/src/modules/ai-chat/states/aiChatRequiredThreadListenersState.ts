import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatRequiredThreadListenersState = createAtomState<
  Record<string, string>
>({
  key: 'aiChatRequiredThreadListenersState',
  defaultValue: {},
});
