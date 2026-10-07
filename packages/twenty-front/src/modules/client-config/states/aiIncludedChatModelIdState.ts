import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiIncludedChatModelIdState = createAtomState<string | null>({
  key: 'aiIncludedChatModelIdState',
  defaultValue: null,
});
