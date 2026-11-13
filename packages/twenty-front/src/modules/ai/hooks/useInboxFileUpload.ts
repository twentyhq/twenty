import { inboxSelectedFilesState } from '@/ai/states/inboxSelectedFilesState';
import { inboxUploadedFilesState } from '@/ai/states/inboxUploadedFilesState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { type InboxFileUIPart } from '@/ai/types/InboxFileUIPart';
import { FileFolder } from '~/generated-metadata/graphql';

export const useInboxFileUpload = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const setInboxSelectedFiles = useSetAtomState(inboxSelectedFilesState);
  const setInboxUploadedFiles = useSetAtomState(inboxUploadedFilesState);
  const store = useStore();

  const sendFile = async (file: File): Promise<InboxFileUIPart | null> => {
    const abortController = new AbortController();
    const unsubscribeFromSelectedFiles = store.sub(
      inboxSelectedFilesState.atom,
      () => {
        if (!store.get(inboxSelectedFilesState.atom).includes(file)) {
          abortController.abort();
        }
      },
    );

    try {
      const uploadedFile = await directUploadFile(file, {
        fileFolder: FileFolder.AgentChat,
        signal: abortController.signal,
      });

      if (!store.get(inboxSelectedFilesState.atom).includes(file)) {
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
      setInboxSelectedFiles((previousSelectedFiles) =>
        previousSelectedFiles.filter((selectedFile) => selectedFile !== file),
      );
    }
  };

  const uploadFiles = async (files: File[]) => {
    const currentInboxThread = store.get(currentInboxThreadState.atom);
    const currentThread = store.get(
      inboxThreadRecordFamilySelector.selectorFamily(currentInboxThread ?? ''),
    );

    if (
      currentThread?.conversationType ===
      AgentChatThreadConversationType.DIRECT_MESSAGE
    ) {
      return [];
    }

    setInboxSelectedFiles((previousSelectedFiles) => [
      ...previousSelectedFiles,
      ...files,
    ]);

    const successfulUploads = (await Promise.all(files.map(sendFile))).filter(
      isDefined,
    );

    if (isNonEmptyArray(successfulUploads)) {
      setInboxUploadedFiles((previousUploadedFiles) => [
        ...previousUploadedFiles,
        ...successfulUploads,
      ]);
    }

    return successfulUploads;
  };

  return { uploadFiles };
};
