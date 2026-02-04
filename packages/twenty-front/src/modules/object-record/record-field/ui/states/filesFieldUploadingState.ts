import { atomFamily } from 'recoil';

type FilesFieldUploadWindowOpenKey = {
  recordId: string;
  fieldName: string;
};

export const filesFieldUploadWindowOpenState = atomFamily<
  boolean,
  FilesFieldUploadWindowOpenKey
>({
  key: 'filesFieldUploadWindowOpenState',
  default: false,
});
