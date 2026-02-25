import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCreatingChatThreadStateV2 = createAtomState<boolean>({
  key: 'ai/isCreatingChatThreadStateV2',
  defaultValue: false,
});
