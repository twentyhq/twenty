import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

type FilesFieldUploadStateKey = {
  recordId: string;
  fieldName: string;
};

type FilesFieldUploadState = 'UPLOAD_WINDOW_OPEN' | 'UPLOADING_FILE' | null;

export const filesFieldUploadState = createAtomFamilyState<
  FilesFieldUploadState,
  FilesFieldUploadStateKey
>({
  key: 'filesFieldUploadState',
  defaultValue: null,
});
