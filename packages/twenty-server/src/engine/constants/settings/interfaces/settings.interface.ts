export interface Settings {
  storage: {
    maxFileSize: `${number}MB`;
    maxDirectUploadFileSize: `${number}MB` | `${number}GB`;
    maxCorePictureFileSize: `${number}MB`;
  };
  minLengthOfStringForDuplicateCheck: number;
  maxVisibleViewFields: number;
}
