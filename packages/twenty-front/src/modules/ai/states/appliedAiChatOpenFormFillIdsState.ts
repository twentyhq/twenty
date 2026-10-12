import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const appliedAiChatOpenFormFillIdsState = createAtomState<string[]>({
  key: 'ai/appliedAiChatOpenFormFillIdsState',
  defaultValue: [],
});
