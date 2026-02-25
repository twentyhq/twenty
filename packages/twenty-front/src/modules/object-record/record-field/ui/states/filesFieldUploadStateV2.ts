import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

type FilesFieldUploadStateKey = {
  recordId: string;
  fieldName: string;
};

type FilesFieldUploadState = 'UPLOAD_WINDOW_OPEN' | 'UPLOADING_FILE' | null;

export const filesFieldUploadStateV2 = createAtomFamilyState<
  FilesFieldUploadState,
  FilesFieldUploadStateKey
>({
  key: 'filesFieldUploadStateV2',
  defaultValue: null,
});
