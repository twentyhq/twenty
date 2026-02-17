import { type FileUIPart } from 'ai';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const agentChatUploadedFilesStateV2 = createStateV2<FileUIPart[]>({
  key: 'ai/agentChatUploadedFilesStateV2',
  defaultValue: [],
});
