import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const focusStackState = createAtomState<FocusStackItem[]>({
  key: 'focusStackState',
  defaultValue: [],
});
