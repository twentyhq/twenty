import { atomFamily } from 'recoil';

type FilesFieldUploadStateKey = {
  recordId: string;
  fieldName: string;
};

type FilesFieldUploadState = 'UPLOAD_WINDOW_OPEN' | 'UPLOADING_FILE' | null;

export const filesFieldUploadState = atomFamily<
  FilesFieldUploadState,
  FilesFieldUploadStateKey
>({
  key: 'filesFieldUploadState',
  default: null,
});
