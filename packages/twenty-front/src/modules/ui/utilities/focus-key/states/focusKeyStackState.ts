import { FocusKey } from '@/ui/utilities/focus-key/types/focusKey';
import { createState } from 'twenty-ui/utilities';

export const focusKeyStackState = createState<FocusKey[]>({
  key: 'focusKeyStackState',
  defaultValue: [],
});
