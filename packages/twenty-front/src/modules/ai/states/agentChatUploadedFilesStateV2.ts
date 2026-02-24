import { type FileUIPart } from 'ai';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const agentChatUploadedFilesStateV2 = createState<FileUIPart[]>({
  key: 'ai/agentChatUploadedFilesStateV2',
  defaultValue: [],
});
