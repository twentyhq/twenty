import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const focusStackState = createState<FocusStackItem[]>({
  key: 'focusStackState',
  defaultValue: [],
});
