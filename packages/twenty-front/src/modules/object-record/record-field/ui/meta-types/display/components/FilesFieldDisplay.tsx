import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFilesFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFilesFieldDisplay';
import { filesFieldUploadState } from '@/object-record/record-field/ui/states/filesFieldUploadState';
import { FilesDisplay } from '@/ui/field/display/components/FilesDisplay';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export const FilesFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { fieldValue, disableChipClick } = useFilesFieldDisplay();

  const uploadState = useRecoilValue(
    filesFieldUploadState({
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );

  const isUploadWindowOpen = uploadState === 'UPLOAD_WINDOW_OPEN';
  const isFileUploading = uploadState === 'UPLOADING_FILE';

  return (
    <FilesDisplay
      value={fieldValue}
      forceDisableClick={disableChipClick}
      isUploadWindowOpen={isUploadWindowOpen}
      isFileUploading={isFileUploading}
    />
  );
};
