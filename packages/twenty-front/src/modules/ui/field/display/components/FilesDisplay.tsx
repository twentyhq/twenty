import { downloadFile } from '@/activities/files/utils/downloadFile';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FileChip } from '@/ui/field/display/components/FileChip';
import { FilePreviewModal } from '@/ui/field/display/components/FilePreviewModal';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const PREVIEW_MODAL_ID = 'files-display-preview-modal';

type FilesDisplayProps = {
  value?: FieldFilesValue[];
};

export const FilesDisplay = ({ value }: FilesDisplayProps) => {
  const [previewedFile, setPreviewedFile] = useState<FieldFilesValue | null>(
    null,
  );
  const { openModal, closeModal } = useModal();
  const isAttachmentPreviewEnabled = useRecoilValue(
    isAttachmentPreviewEnabledState,
  );

  const handlePreview = (file: FieldFilesValue) => {
    if (!isAttachmentPreviewEnabled) {
      // If preview is not enabled, download directly
      if (isDefined(file.url)) {
        downloadFile(file.url, file.label ?? 'file');
      }
      return;
    }
    setPreviewedFile(file);
    openModal(PREVIEW_MODAL_ID);
  };

  const handleClosePreview = () => {
    closeModal(PREVIEW_MODAL_ID);
    setPreviewedFile(null);
  };

  if (!isDefined(value) || value.length === 0) {
    return <></>;
  }

  return (
    <>
      <ExpandableList>
        {value.map((file, index) => (
          <FileChip key={index} file={file} onClick={handlePreview} />
        ))}
      </ExpandableList>
      {isAttachmentPreviewEnabled && (
        <FilePreviewModal
          file={previewedFile}
          modalId={PREVIEW_MODAL_ID}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
};
