import { createState } from '@/ui/utilities/state/utils/createState';

export const lockedListenerIdState = createState<string | null>({
  key: 'lockedListenerIdState',
  defaultValue: null,
});
