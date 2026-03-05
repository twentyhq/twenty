import { type FileUIPart } from 'ai';

export type AgentChatFileUIPart = FileUIPart & {
  fileId: string;
};
