import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const shouldFocusChatEditorFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'ai/shouldFocusChatEditorFamilyState',
  defaultValue: false,
});
