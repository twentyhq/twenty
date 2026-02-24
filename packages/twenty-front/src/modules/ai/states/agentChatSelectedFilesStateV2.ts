import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const agentChatSelectedFilesStateV2 = createState<File[]>({
  key: 'ai/agentChatSelectedFilesStateV2',
  defaultValue: [],
});
