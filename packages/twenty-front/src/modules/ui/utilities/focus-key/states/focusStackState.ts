import { FocusIdentifier } from '@/ui/utilities/focus-key/types/FocusIdentifier';
import { createState } from 'twenty-ui/utilities';

export const focusStackState = createState<FocusIdentifier[]>({
  key: 'focusStackState',
  defaultValue: [],
});
