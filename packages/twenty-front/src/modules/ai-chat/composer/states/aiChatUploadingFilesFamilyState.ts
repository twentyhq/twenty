import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatUploadingFilesFamilyState = createAtomFamilyState<
  File[],
  { threadId: string }
>({
  key: 'ai/aiChatUploadingFilesFamilyState',
  defaultValue: [],
});
