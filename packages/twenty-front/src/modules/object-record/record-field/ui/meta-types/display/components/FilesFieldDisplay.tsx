import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFilesFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFilesFieldDisplay';
import { filesFieldUploadState } from '@/object-record/record-field/ui/states/filesFieldUploadState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { FilesDisplay } from '@/ui/field/display/components/FilesDisplay';
import { useContext } from 'react';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type FilesFieldDisplayProps = FieldDisplayTooltipProps;

export const FilesFieldDisplay = ({
  withTooltip,
  measureOverflowOnOpen,
}: FilesFieldDisplayProps) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { fieldValue, disableChipClick } = useFilesFieldDisplay();

  const filesFieldUpload = useAtomFamilyStateValue(filesFieldUploadState, {
    recordId,
    fieldName: fieldDefinition.metadata.fieldName,
  });

  const isUploadWindowOpen = filesFieldUpload === 'UPLOAD_WINDOW_OPEN';
  const isFileUploading = filesFieldUpload === 'UPLOADING_FILE';

  return (
    <FilesDisplay
      value={fieldValue}
      forceDisableClick={disableChipClick}
      isUploadWindowOpen={isUploadWindowOpen}
      isFileUploading={isFileUploading}
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
    />
  );
};
