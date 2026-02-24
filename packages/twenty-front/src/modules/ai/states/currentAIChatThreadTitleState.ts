import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentAIChatThreadTitleState = createStateV2<string | null>({
  key: 'ai/currentAIChatThreadTitleState',
  defaultValue: null,
});
