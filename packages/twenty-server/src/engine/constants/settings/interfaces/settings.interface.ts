export interface Settings {
  storage: {
    maxMultipartFileSize: `${number}MB`;
    maxDirectUploadFileSize: `${number}MB` | `${number}GB`;
  };
  maxRequestBodySize: `${number}MB`;
  minLengthOfStringForDuplicateCheck: number;
  maxVisibleViewFields: number;
}
