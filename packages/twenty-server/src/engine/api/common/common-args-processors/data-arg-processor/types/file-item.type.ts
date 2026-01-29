export type FileItemInput = {
  fileId: string;
  label: string;
};

export type FileItemOutput = FileItemInput & {
  extension: string;
};

export type SignedFileItemOutput = FileItemOutput & {
  token: string;
};
