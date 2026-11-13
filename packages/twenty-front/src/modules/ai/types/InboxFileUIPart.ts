import { type FileUIPart } from 'ai';

export type InboxFileUIPart = FileUIPart & {
  fileId: string;
  filename: string;
};
