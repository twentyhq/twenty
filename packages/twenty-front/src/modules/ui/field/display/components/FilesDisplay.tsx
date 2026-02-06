import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FileChip } from '@/ui/field/display/components/FileChip';
import { UploadFileChip } from '@/ui/field/display/components/UploadFileChip';
import { filePreviewState } from '@/ui/field/display/states/filePreviewState';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { useRecoilValue, useSetRecoilState } from 'recoil';
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
  const setFilePreview = useSetRecoilState(filePreviewState);
  const isAttachmentPreviewEnabled = useRecoilValue(
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
    <ExpandableList>
      {value.map((file) => (
        <FileChip
          key={file.fileId}
          file={file}
          onClick={handlePreview}
          forceDisableClick={forceDisableClick}
        />
      ))}
    </ExpandableList>
  );
};
