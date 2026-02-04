import { atomFamily } from 'recoil';

type FilesFieldIsUploadingKey = {
  recordId: string;
  fieldName: string;
};

export const filesFieldIsUploadingState = atomFamily<
  boolean,
  FilesFieldIsUploadingKey
>({
  key: 'filesFieldIsUploadingState',
  default: false,
});
