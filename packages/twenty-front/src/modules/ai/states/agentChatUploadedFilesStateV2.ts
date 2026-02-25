import { type FileUIPart } from 'ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatUploadedFilesStateV2 = createAtomState<FileUIPart[]>({
  key: 'ai/agentChatUploadedFilesStateV2',
  defaultValue: [],
});
