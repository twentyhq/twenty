import { createFamilyState } from '@/ui/utilities/state/jotai/utils/createFamilyState';

type FilesFieldUploadStateKey = {
  recordId: string;
  fieldName: string;
};

type FilesFieldUploadState = 'UPLOAD_WINDOW_OPEN' | 'UPLOADING_FILE' | null;

export const filesFieldUploadStateV2 = createFamilyState<
  FilesFieldUploadState,
  FilesFieldUploadStateKey
>({
  key: 'filesFieldUploadStateV2',
  defaultValue: null,
});
