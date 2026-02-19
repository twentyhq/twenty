import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const focusStackState = createStateV2<FocusStackItem[]>({
  key: 'focusStackState',
  defaultValue: [],
});
