import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const agentChatInputStateV2 = createState<string>({
  key: 'agentChatInputStateV2',
  defaultValue: '',
});
