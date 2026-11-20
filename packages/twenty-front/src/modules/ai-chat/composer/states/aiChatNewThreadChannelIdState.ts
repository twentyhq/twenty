import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatNewThreadChannelIdState = createAtomState<string | null>({
  key: 'ai/aiChatNewThreadChannelIdState',
  defaultValue: null,
});
