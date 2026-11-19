import { aiChatSelectedFilesFamilyState } from '@/ai-chat/composer/states/aiChatSelectedFilesFamilyState';
import { aiChatUploadedFilesFamilyState } from '@/ai-chat/composer/states/aiChatUploadedFilesFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { type AiChatFileUIPart } from '@/ai-chat/composer/types/AiChatFileUIPart';
import { FileFolder } from '~/generated-metadata/graphql';

export const useAiChatFileUpload = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const store = useStore();

  const sendFile = async ({
    file,
    threadId,
  }: {
    file: File;
    threadId: string;
  }): Promise<AiChatFileUIPart | null> => {
    const selectedFilesAtom = aiChatSelectedFilesFamilyState.atomFamily({
      threadId,
    });
    const abortController = new AbortController();
    const unsubscribeFromSelectedFiles = store.sub(selectedFilesAtom, () => {
      if (!store.get(selectedFilesAtom).includes(file)) {
        abortController.abort();
      }
    });

    try {
      const uploadedFile = await directUploadFile(file, {
        fileFolder: FileFolder.AgentChat,
        signal: abortController.signal,
      });

      if (!store.get(selectedFilesAtom).includes(file)) {
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
      unsubscribeFromSelectedFiles();
      store.set(selectedFilesAtom, (previousSelectedFiles) =>
        previousSelectedFiles.filter((selectedFile) => selectedFile !== file),
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

    store.set(
      aiChatSelectedFilesFamilyState.atomFamily({ threadId }),
      (previousSelectedFiles) => [...previousSelectedFiles, ...files],
    );

    const successfulUploads = (
      await Promise.all(files.map((file) => sendFile({ file, threadId })))
    ).filter(isDefined);

    if (isNonEmptyArray(successfulUploads)) {
      store.set(
        aiChatUploadedFilesFamilyState.atomFamily({ threadId }),
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
