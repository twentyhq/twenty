import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { type ChatThreadDraftAttachment } from '@/activities/emails/types/ChatThreadDraftAttachment';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useFileUpload } from '@/file-upload/hooks/useFileUpload';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  FieldMetadataType,
  FileFolder,
} from '~/generated-metadata/graphql';

export const useChatThreadDraftAttachments = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { uploadFile } = useDirectFileUpload();
  const { openFileUpload } = useFileUpload();
  const isMessageAttachmentEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_MESSAGE_ATTACHMENT_ENABLED,
  );
  const { objectMetadataItem: attachmentMetadataItem } = useObjectMetadataItem({
    objectNameSingular: StandardObjectNameSingular.Attachment,
  });
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [draftAttachments, setDraftAttachments] = useState<
    ChatThreadDraftAttachment[]
  >([]);
  const abortControllerByFile = useRef(new Map<File, AbortController>());

  const attachmentFileFieldMetadataId = attachmentMetadataItem.fields.find(
    (field) => field.type === FieldMetadataType.FILES && field.name === 'file',
  )?.id;

  const uploadDraftAttachment = async (
    file: File,
    fieldMetadataId: string,
  ): Promise<ChatThreadDraftAttachment | null> => {
    const abortController = new AbortController();

    abortControllerByFile.current.set(file, abortController);

    try {
      // the server only attaches to a message files uploaded into the attachment file field
      const uploadedFile = await uploadFile(file, {
        fileFolder: FileFolder.FilesField,
        fieldMetadataId,
        signal: abortController.signal,
      });

      if (abortController.signal.aborted) {
        return null;
      }

      return {
        type: 'file',
        fileId: uploadedFile.id,
        filename: file.name,
        mediaType: file.type,
        url: uploadedFile.url,
      };
    } catch {
      const fileName = file.name;

      if (!abortController.signal.aborted) {
        enqueueToast({
          status: 'error',
          children: t`Failed to upload file: ${fileName}`,
        });
      }

      return null;
    } finally {
      abortControllerByFile.current.delete(file);
      setUploadingFiles((currentUploadingFiles) =>
        currentUploadingFiles.filter((uploadingFile) => uploadingFile !== file),
      );
    }
  };

  const attachFiles = async (files: File[]) => {
    if (!isDefined(attachmentFileFieldMetadataId) || files.length === 0) {
      return;
    }

    setUploadingFiles((currentUploadingFiles) => [
      ...currentUploadingFiles,
      ...files,
    ]);

    const uploadedAttachments = (
      await Promise.all(
        files.map((file) =>
          uploadDraftAttachment(file, attachmentFileFieldMetadataId),
        ),
      )
    ).filter(isDefined);

    setDraftAttachments((currentDraftAttachments) => [
      ...currentDraftAttachments,
      ...uploadedAttachments,
    ]);
  };

  const cancelUpload = (file: File) => {
    abortControllerByFile.current.get(file)?.abort();
    setUploadingFiles((currentUploadingFiles) =>
      currentUploadingFiles.filter((uploadingFile) => uploadingFile !== file),
    );
  };

  const removeDraftAttachment = (fileId: string) =>
    setDraftAttachments((currentDraftAttachments) =>
      currentDraftAttachments.filter(
        (draftAttachment) => draftAttachment.fileId !== fileId,
      ),
    );

  return {
    canAttachFiles:
      isMessageAttachmentEnabled && isDefined(attachmentFileFieldMetadataId),
    uploadingFiles,
    draftAttachments,
    attachFiles,
    cancelUpload,
    removeDraftAttachment,
    clearDraftAttachments: () => setDraftAttachments([]),
    openAttachmentPicker: () =>
      openFileUpload({ multiple: true, onUpload: attachFiles }),
  };
};
