import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentAIChatThreadStateV2 = createStateV2<string | null>({
  key: 'ai/currentAIChatThreadStateV2',
  defaultValue: null,
});
