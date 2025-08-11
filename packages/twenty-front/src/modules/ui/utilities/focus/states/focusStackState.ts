import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { createState } from 'twenty-ui/utilities';

export const focusStackState = createState<FocusStackItem[]>({
  key: 'focusStackState',
  defaultValue: [],
});
