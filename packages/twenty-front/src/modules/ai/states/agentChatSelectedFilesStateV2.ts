import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const agentChatSelectedFilesStateV2 = createStateV2<File[]>({
  key: 'ai/agentChatSelectedFilesStateV2',
  defaultValue: [],
});
