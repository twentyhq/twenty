import { atom } from 'recoil';

export type AgentChatFile = {
  id: string;
  name: string;
  fullPath: string;
  size: number;
  type: string;
  createdAt: string;
};

export const agentChatUploadedFilesState = atom<AgentChatFile[]>({
  key: 'agentChatUploadedFilesState',
  default: [],
});
