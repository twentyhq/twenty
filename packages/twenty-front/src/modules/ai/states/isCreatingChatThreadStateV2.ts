import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isCreatingChatThreadStateV2 = createState<boolean>({
  key: 'ai/isCreatingChatThreadStateV2',
  defaultValue: false,
});
