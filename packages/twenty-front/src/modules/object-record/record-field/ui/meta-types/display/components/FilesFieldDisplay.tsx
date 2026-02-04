import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFilesFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFilesFieldDisplay';
import { filesFieldIsUploadingState } from '@/object-record/record-field/ui/states/filesFieldIsUploadingState';
import { filesFieldUploadWindowOpenState } from '@/object-record/record-field/ui/states/filesFieldUploadWindowOpenState';
import { FilesDisplay } from '@/ui/field/display/components/FilesDisplay';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

export const FilesFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { fieldValue, disableChipClick } = useFilesFieldDisplay();

  const isUploadWindowOpen = useRecoilValue(
    filesFieldUploadWindowOpenState({
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );

  const isFileUploading = useRecoilValue(
    filesFieldIsUploadingState({
      recordId,
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );

  return (
    <FilesDisplay
      value={fieldValue}
      forceDisableClick={disableChipClick}
      isUploadWindowOpen={isUploadWindowOpen}
      isFileUploading={isFileUploading}
    />
  );
};
