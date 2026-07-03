export interface Settings {
  storage: {
    maxFileSize: `${number}MB`;
  };
  minLengthOfStringForDuplicateCheck: number;
  maxVisibleViewFields: number;
}
