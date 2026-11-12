// mirrors SendAppMessageAttachment from twenty-sdk 2.59, which the pinned SDK does not export yet
export type SendAppMessageAttachment = {
  filename: string;
  contentType: string;
  size: number;
  downloadUrl: string;
};
