import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFilesFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFilesFieldDisplay';
import { filesFieldUploadStateV2 } from '@/object-record/record-field/ui/states/filesFieldUploadStateV2';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { FilesDisplay } from '@/ui/field/display/components/FilesDisplay';
import { useContext } from 'react';

export const FilesFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { fieldValue, disableChipClick } = useFilesFieldDisplay();

  const uploadState = useFamilyRecoilValueV2(filesFieldUploadStateV2, {
    recordId,
    fieldName: fieldDefinition.metadata.fieldName,
  });

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
