import { useLingui } from '@lingui/react/macro';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FileChip } from '@/ui/field/display/components/FileChip';
import { UploadFileChip } from '@/ui/field/display/components/UploadFileChip';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { OverflowingList } from 'twenty-ui/components/layout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
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

  const setFilePreview = useSetAtomState(filePreviewState);
  const isAttachmentPreviewEnabled = useAtomStateValue(
    isAttachmentPreviewEnabledState,
  );

  const handlePreview = (file: FieldFilesValue) => {
    if (!isAttachmentPreviewEnabled) {
      if (isDefined(file.url)) {
        downloadFile(file.url, file.label ?? 'file');
      }
      return;
    }
    setFilePreview(file);
  };

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
          onClick={handlePreview}
          forceDisableClick={forceDisableClick}
        />
      ))}
    </OverflowingList>
  );
};
