export type AddOrUpdateFileItemInput = {
  fileId: string;
  label: string;
};

export type RemoveFileItemInput = {
  fileId: string;
};

export type FileItemOutput = AddOrUpdateFileItemInput & {
  extension: string;
};
