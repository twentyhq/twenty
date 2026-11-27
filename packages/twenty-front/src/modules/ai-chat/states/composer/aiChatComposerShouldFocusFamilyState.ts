import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatComposerShouldFocusFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'aiChatComposerShouldFocusFamilyState',
  defaultValue: false,
});
