import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatComposerShouldSendFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'aiChatComposerShouldSendFamilyState',
  defaultValue: false,
});
