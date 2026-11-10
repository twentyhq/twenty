import { useLingui } from '@lingui/react/macro';
import { type Dispatch, type SetStateAction, useState } from 'react';
import {
  type EmailAttachment,
  StandardObjectNameSingular,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/maxAttachmentSize';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useToast } from 'twenty-ui/components/feedback';
import { FieldMetadataType, FileFolder } from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type UseAttachChatFilesArgs = {
  onFilesAttached: Dispatch<SetStateAction<EmailAttachment[]>>;
};

export const useAttachChatFiles = ({
  onFilesAttached,
}: UseAttachChatFilesArgs) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { openFileUpload } = useFileUpload();
  const { uploadFile } = useDirectFileUpload();
  const { objectMetadataItem: attachmentMetadataItem } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.Attachment,
  });
  const [pendingUploadCount, setPendingUploadCount] = useState(0);

  // the server only attaches to a message files uploaded into this field
  const attachmentFileFieldMetadataId = attachmentMetadataItem.fields.find(
    (field) => field.type === FieldMetadataType.FILES && field.name === 'file',
  )?.id;

  const uploadChatAttachment = async (
    file: File,
  ): Promise<EmailAttachment | null> => {
    const fileName = file.name;

    if (file.size > MAX_ATTACHMENT_SIZE) {
      const maxUploadSize = formatFileSize(MAX_ATTACHMENT_SIZE);

      enqueueToast({
        status: 'error',
        children: t`File "${fileName}" exceeds ${maxUploadSize}`,
      });

      return null;
    }

    try {
      const uploadedFile = await uploadFile(file, {
        fileFolder: FileFolder.FilesField,
        fieldMetadataId: attachmentFileFieldMetadataId,
      });

      return { id: uploadedFile.id, name: fileName };
    } catch (error) {
      logError(`Failed to upload chat attachment "${fileName}": ${error}`);

      enqueueToast({
        status: 'error',
        children: t`Failed to upload "${fileName}"`,
      });

      return null;
    }
  };

  const handleUploadFiles = async (filesToUpload: File[]) => {
    setPendingUploadCount((count) => count + 1);

    try {
      const uploadedFiles = await Promise.all(
        filesToUpload.map(uploadChatAttachment),
      );

      onFilesAttached((previousFiles) => [
        ...previousFiles,
        ...uploadedFiles.filter(isDefined),
      ]);
    } finally {
      setPendingUploadCount((count) => count - 1);
    }
  };

  const openAttachmentPicker = () => {
    openFileUpload({ multiple: true, onUpload: handleUploadFiles });
  };

  return {
    openAttachmentPicker,
    isUploadingAttachments: pendingUploadCount > 0,
  };
};
