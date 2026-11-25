import { aiChatComposerUploadingFilesFamilyState } from '@/ai-chat/composer/states/aiChatComposerUploadingFilesFamilyState';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/composer/states/aiChatComposerAttachmentsFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import {
  AgentChatThreadConversationType,
  CODE_INTERPRETER_MAX_INPUT_FILE_SIZE_BYTES,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { type AiChatFileUIPart } from '@/ai-chat/types/AiChatFileUIPart';
import { FileFolder } from '~/generated-metadata/graphql';

export const useAiChatFileUpload = () => {
  const { uploadFile } = useDirectFileUpload();
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const store = useStore();

  const uploadComposerFile = async ({
    file,
    threadId,
  }: {
    file: File;
    threadId: string;
  }): Promise<AiChatFileUIPart | null> => {
    const uploadingFilesAtom =
      aiChatComposerUploadingFilesFamilyState.atomFamily({
        threadId,
      });
    const abortController = new AbortController();
    const unsubscribeFromUploadingFiles = store.sub(uploadingFilesAtom, () => {
      if (!store.get(uploadingFilesAtom).includes(file)) {
        abortController.abort();
      }
    });

    try {
      const uploadedFile = await uploadFile(file, {
        fileFolder: FileFolder.AgentChat,
        signal: abortController.signal,
      });

      if (!store.get(uploadingFilesAtom).includes(file)) {
        return null;
      }

      return {
        filename: file.name,
        mediaType: file.type,
        url: uploadedFile.url,
        fileId: uploadedFile.id,
        type: 'file',
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
      unsubscribeFromUploadingFiles();
      store.set(uploadingFilesAtom, (previousUploadingFiles) =>
        previousUploadingFiles.filter((selectedFile) => selectedFile !== file),
      );
    }
  };

  const uploadFiles = async ({
    files,
    threadId,
  }: {
    files: File[];
    threadId: string;
  }) => {
    const currentThread = store.get(
      aiChatThreadRecordFamilySelector.selectorFamily(threadId),
    );

    if (
      currentThread?.conversationType ===
      AgentChatThreadConversationType.DIRECT_MESSAGE
    ) {
      return [];
    }

    const acceptedFiles = files.filter((file) => {
      if (file.size <= CODE_INTERPRETER_MAX_INPUT_FILE_SIZE_BYTES) {
        return true;
      }

      const fileName = file.name;
      const maxUploadSize = formatFileSize(
        CODE_INTERPRETER_MAX_INPUT_FILE_SIZE_BYTES,
      );

      enqueueToast({
        status: 'error',
        children: t`Couldn't attach "${fileName}". Files must be ${maxUploadSize} or smaller.`,
      });

      return false;
    });

    if (!isNonEmptyArray(acceptedFiles)) {
      return [];
    }

    store.set(
      aiChatComposerUploadingFilesFamilyState.atomFamily({ threadId }),
      (previousUploadingFiles) => [...previousUploadingFiles, ...acceptedFiles],
    );

    const successfulUploads = (
      await Promise.all(
        acceptedFiles.map((file) => uploadComposerFile({ file, threadId })),
      )
    ).filter(isDefined);

    if (isNonEmptyArray(successfulUploads)) {
      store.set(
        aiChatComposerAttachmentsFamilyState.atomFamily({ threadId }),
        (previousUploadedFiles) => [
          ...previousUploadedFiles,
          ...successfulUploads,
        ],
      );
    }

    return successfulUploads;
  };

  return { uploadFiles };
};
