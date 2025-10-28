import { type FileUIPart } from 'ai';
import { atom } from 'recoil';

export const agentChatUploadedFilesState = atom<FileUIPart[]>({
  key: 'ai/agentChatUploadedFilesState',
  default: [],
});
