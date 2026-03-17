import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentConversationIdState = createStateV2<string | null>({
  key: 'currentConversationIdState',
  defaultValue: null,
  useLocalStorage: true,
});
