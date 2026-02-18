import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isCreatingChatThreadStateV2 = createStateV2<boolean>({
  key: 'ai/isCreatingChatThreadStateV2',
  defaultValue: false,
});
