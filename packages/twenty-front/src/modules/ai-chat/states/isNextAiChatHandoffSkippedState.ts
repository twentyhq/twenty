import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isNextAiChatHandoffSkippedState = createAtomState<boolean>({
  key: 'isNextAiChatHandoffSkippedState',
  defaultValue: false,
});
