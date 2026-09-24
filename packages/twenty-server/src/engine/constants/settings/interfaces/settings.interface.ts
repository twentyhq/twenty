export interface Settings {
  storage: {
    maxMultipartFileSize: `${number}MB`;
    maxDirectUploadFileSize: `${number}MB` | `${number}GB`;
    maxCorePictureFileSize: `${number}MB`;
  };
  maxRequestBodySize: `${number}MB`;
  minLengthOfStringForDuplicateCheck: number;
  maxVisibleViewFields: number;
}
