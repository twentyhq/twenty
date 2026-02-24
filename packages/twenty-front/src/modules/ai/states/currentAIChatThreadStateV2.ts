import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const currentAIChatThreadStateV2 = createState<string | null>({
  key: 'ai/currentAIChatThreadStateV2',
  defaultValue: null,
});
