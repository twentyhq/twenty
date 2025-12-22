export type CodeInterpreterFileInput = {
  filename: string;
  url: string;
};

export type CodeInterpreterInput = {
  code: string;
  files?: CodeInterpreterFileInput[];
};
