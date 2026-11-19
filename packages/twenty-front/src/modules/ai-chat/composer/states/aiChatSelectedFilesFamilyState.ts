import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatSelectedFilesFamilyState = createAtomFamilyState<
  File[],
  { threadId: string }
>({
  key: 'ai/aiChatSelectedFilesFamilyState',
  defaultValue: [],
});
