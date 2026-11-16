import { useLingui } from '@lingui/react/macro';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FileChip } from '@/ui/field/display/components/FileChip';
import { UploadFileChip } from '@/ui/field/display/components/UploadFileChip';
import { useOpenFilePreview } from '@/ui/field/display/hooks/useOpenFilePreview';
import { OverflowingList } from 'twenty-ui/components/layout';
import { isDefined } from 'twenty-shared/utils';

type FilesDisplayProps = {
  value?: FieldFilesValue[];
  forceDisableClick?: boolean;
  isUploadWindowOpen?: boolean;
  isFileUploading?: boolean;
};

export const FilesDisplay = ({
  value,
  forceDisableClick,
  isUploadWindowOpen = false,
  isFileUploading = false,
}: FilesDisplayProps) => {
  const { t } = useLingui();

  const { openFilePreview } = useOpenFilePreview();

  if (!isDefined(value) || value.length === 0) {
    if (isFileUploading) {
      return <UploadFileChip isLoading={true} />;
    }
    if (isUploadWindowOpen) {
      return <UploadFileChip isLoading={false} />;
    }
    return <></>;
  }

  return (
    <OverflowingList overflowLabel={t`Show all items`}>
      {value.map((file) => (
        <FileChip
          key={file.fileId}
          file={file}
          onClick={openFilePreview}
          forceDisableClick={forceDisableClick}
        />
      ))}
    </OverflowingList>
  );
};
