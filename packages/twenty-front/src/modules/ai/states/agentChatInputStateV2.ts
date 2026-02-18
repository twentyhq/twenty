import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const agentChatInputStateV2 = createStateV2<string>({
  key: 'agentChatInputStateV2',
  defaultValue: '',
});
