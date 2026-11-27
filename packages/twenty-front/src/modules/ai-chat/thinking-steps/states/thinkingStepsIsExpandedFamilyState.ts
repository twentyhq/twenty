import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const thinkingStepsIsExpandedFamilyState = createAtomFamilyState<
  boolean,
  { messageId: string; renderItemIndex: number }
>({
  key: 'thinkingStepsIsExpandedFamilyState',
  defaultValue: false,
});
