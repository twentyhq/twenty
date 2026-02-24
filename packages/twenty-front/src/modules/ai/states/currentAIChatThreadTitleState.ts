import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const currentAIChatThreadTitleState = createState<string | null>({
  key: 'ai/currentAIChatThreadTitleState',
  defaultValue: null,
});
