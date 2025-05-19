import { FocusIdentifier } from '@/ui/utilities/focus/types/FocusIdentifier';
import { createState } from 'twenty-ui/utilities';

export const focusStackState = createState<FocusIdentifier[]>({
  key: 'focusStackState',
  defaultValue: [],
});
