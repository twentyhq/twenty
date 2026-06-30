import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCreatingChatThreadState = createAtomState<boolean>({
  key: 'ai/isCreatingChatThreadState',
  defaultValue: false,
});
