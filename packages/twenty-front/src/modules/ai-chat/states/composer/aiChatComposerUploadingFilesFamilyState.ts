import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatComposerUploadingFilesFamilyState = createAtomFamilyState<
  File[],
  { threadId: string }
>({
  key: 'aiChatComposerUploadingFilesFamilyState',
  defaultValue: [],
});
