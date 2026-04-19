export type FileInput = {
  fileId: string;
  label: string;
};

export type FileOutput = FileInput & {
  extension: string;
};

export type SignedFileOutput = FileOutput & {
  Url: string;
};
