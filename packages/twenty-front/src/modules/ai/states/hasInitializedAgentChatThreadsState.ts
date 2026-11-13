import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasInitializedAiChatThreadsState = createAtomState<boolean>({
  key: 'hasInitializedAiChatThreadsState',
  defaultValue: false,
});
