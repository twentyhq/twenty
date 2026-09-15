export type CodeInterpreterFileInput = {
  filename: string;
  fileId: string;
};

export type CodeInterpreterInput = {
  code: string;
  files?: CodeInterpreterFileInput[];
  loadingMessage: string;
  completedMessage?: string;
};
