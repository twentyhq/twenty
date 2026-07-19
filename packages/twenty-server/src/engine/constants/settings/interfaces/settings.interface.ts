export interface Settings {
  storage: {
    maxFileSize: `${number}MB`;
    maxDirectUploadFileSize: `${number}MB` | `${number}GB`;
  };
  minLengthOfStringForDuplicateCheck: number;
  maxVisibleViewFields: number;
}
