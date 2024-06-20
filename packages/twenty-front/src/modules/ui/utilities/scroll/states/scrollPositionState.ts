import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

export const scrollPositionState = createFamilyState({
  key: 'scroll/scrollPositionState',
  defaultValue: 0,
});
