import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatShouldFocusEditorFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'ai/aiChatShouldFocusEditorFamilyState',
  defaultValue: false,
});
