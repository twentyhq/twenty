import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { CHAT_THREAD_MAX_ATTACHMENT_COUNT } from '@/activities/emails/constants/ChatThreadMaxAttachmentCount';
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

type ChatThreadAttachmentUpload = {
  file: File;
  abortController: AbortController;
};

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
  const [uploads, setUploads] = useState<ChatThreadAttachmentUpload[]>([]);
  const [draftAttachments, setDraftAttachments] = useState<
    ChatThreadDraftAttachment[]
  >([]);

  const attachmentFileFieldMetadataId = attachmentMetadataItem.fields.find(
    (field) => field.type === FieldMetadataType.FILES && field.name === 'file',
  )?.id;

  const removeUpload = (file: File) =>
    setUploads((currentUploads) =>
      currentUploads.filter((upload) => upload.file !== file),
    );

  const uploadDraftAttachment = async ({
    upload: { file, abortController },
    fieldMetadataId,
  }: {
    upload: ChatThreadAttachmentUpload;
    fieldMetadataId: string;
  }) => {
    try {
      const uploadedFile = await uploadFile(file, {
        fileFolder: FileFolder.FilesField,
        fieldMetadataId,
        signal: abortController.signal,
      });

      if (abortController.signal.aborted) {
        return;
      }

      setDraftAttachments((currentDraftAttachments) => [
        ...currentDraftAttachments,
        {
          type: 'file',
          fileId: uploadedFile.id,
          filename: file.name,
          mediaType: file.type,
          url: uploadedFile.url,
        },
      ]);
    } catch {
      const fileName = file.name;

      if (!abortController.signal.aborted) {
        enqueueToast({
          status: 'error',
          children: t`Failed to upload file: ${fileName}`,
        });
      }
    } finally {
      removeUpload(file);
    }
  };

  const attachFiles = async (files: File[]) => {
    if (!isDefined(attachmentFileFieldMetadataId) || files.length === 0) {
      return;
    }

    const acceptedFiles = files.slice(
      0,
      Math.max(
        CHAT_THREAD_MAX_ATTACHMENT_COUNT -
          uploads.length -
          draftAttachments.length,
        0,
      ),
    );

    if (acceptedFiles.length < files.length) {
      enqueueToast({
        status: 'error',
        children: t`A message can carry up to ${CHAT_THREAD_MAX_ATTACHMENT_COUNT} files`,
      });
    }

    const newUploads = acceptedFiles.map((file) => ({
      file,
      abortController: new AbortController(),
    }));

    setUploads((currentUploads) => [...currentUploads, ...newUploads]);

    await Promise.all(
      newUploads.map((upload) =>
        uploadDraftAttachment({
          upload,
          fieldMetadataId: attachmentFileFieldMetadataId,
        }),
      ),
    );
  };

  const cancelUpload = (file: File) => {
    uploads.find((upload) => upload.file === file)?.abortController.abort();
    removeUpload(file);
  };

  const removeDraftAttachment = (fileId: string) =>
    setDraftAttachments((currentDraftAttachments) =>
      currentDraftAttachments.filter(
        (draftAttachment) => draftAttachment.fileId !== fileId,
      ),
    );

  return {
    canUploadAttachments:
      isMessageAttachmentEnabled && isDefined(attachmentFileFieldMetadataId),
    uploadingFiles: uploads.map(({ file }) => file),
    draftAttachments,
    attachFiles,
    cancelUpload,
    removeDraftAttachment,
    clearDraftAttachments: () => setDraftAttachments([]),
    openAttachmentPicker: () =>
      openFileUpload({ multiple: true, onUpload: attachFiles }),
  };
};
