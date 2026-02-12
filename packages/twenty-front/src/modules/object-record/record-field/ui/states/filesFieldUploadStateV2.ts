import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

type FilesFieldUploadStateKey = {
  recordId: string;
  fieldName: string;
};

type FilesFieldUploadState = 'UPLOAD_WINDOW_OPEN' | 'UPLOADING_FILE' | null;

export const filesFieldUploadStateV2 = createFamilyStateV2<
  FilesFieldUploadState,
  FilesFieldUploadStateKey
>({
  key: 'filesFieldUploadStateV2',
  defaultValue: null,
});
