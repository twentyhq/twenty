import { type FileUIPart } from 'ai';

export type AiChatFileUIPart = FileUIPart & {
  fileId: string;
  filename: string;
};
