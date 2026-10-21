import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { type AgentChatFileUIPart } from '@/ai/types/AgentChatFileUIPart';
import { FileFolder } from '~/generated-metadata/graphql';

export const useAiChatFileUpload = () => {
  const { uploadFile: directUploadFile } = useDirectFileUpload();
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const setAgentChatSelectedFiles = useSetAtomState(
    agentChatSelectedFilesState,
  );
  const setAgentChatUploadedFiles = useSetAtomState(
    agentChatUploadedFilesState,
  );
  const store = useStore();

  const sendFile = async (file: File): Promise<AgentChatFileUIPart | null> => {
    const abortController = new AbortController();
    const unsubscribeFromSelectedFiles = store.sub(
      agentChatSelectedFilesState.atom,
      () => {
        if (!store.get(agentChatSelectedFilesState.atom).includes(file)) {
          abortController.abort();
        }
      },
    );

    try {
      const uploadedFile = await directUploadFile(file, {
        fileFolder: FileFolder.AgentChat,
        signal: abortController.signal,
      });

      if (!store.get(agentChatSelectedFilesState.atom).includes(file)) {
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
      setAgentChatSelectedFiles((previousSelectedFiles) =>
        previousSelectedFiles.filter((selectedFile) => selectedFile !== file),
      );
    }
  };

  const uploadFiles = async (files: File[]) => {
    setAgentChatSelectedFiles((previousSelectedFiles) => [
      ...previousSelectedFiles,
      ...files,
    ]);

    const successfulUploads = (await Promise.all(files.map(sendFile))).filter(
      isDefined,
    );

    if (isNonEmptyArray(successfulUploads)) {
      setAgentChatUploadedFiles((previousUploadedFiles) => [
        ...previousUploadedFiles,
        ...successfulUploads,
      ]);
    }
  };

  return { uploadFiles };
};
