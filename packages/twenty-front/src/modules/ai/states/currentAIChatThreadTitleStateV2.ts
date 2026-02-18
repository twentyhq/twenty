import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentAIChatThreadTitleStateV2 = createStateV2<string | null>({
  key: 'ai/currentAIChatThreadTitleStateV2',
  defaultValue: null,
});
