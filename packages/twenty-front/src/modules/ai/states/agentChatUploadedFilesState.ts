import { type FileUIPart } from 'ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatUploadedFilesState = createAtomState<FileUIPart[]>({
  key: 'ai/agentChatUploadedFilesState',
  defaultValue: [],
});
