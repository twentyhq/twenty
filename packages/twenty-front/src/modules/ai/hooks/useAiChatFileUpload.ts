import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadAbortControllersState } from '@/ai/states/agentChatUploadAbortControllersState';
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
  const setAgentChatUploadAbortControllers = useSetAtomState(
    agentChatUploadAbortControllersState,
  );
  const store = useStore();

  const forgetAbortController = (file: File) => {
    setAgentChatUploadAbortControllers((previousControllers) => {
      const nextControllers = new Map(previousControllers);

      nextControllers.delete(file);

      return nextControllers;
    });
  };

  const sendFile = async (file: File): Promise<AgentChatFileUIPart | null> => {
    const abortController = new AbortController();

    setAgentChatUploadAbortControllers((previousControllers) =>
      new Map(previousControllers).set(file, abortController),
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

      // An abort is the person pressing stop or removing the attachment, so it
      // is not worth a toast telling them their own action failed.
      if (!abortController.signal.aborted) {
        enqueueToast({
          status: 'error',
          children: t`Failed to upload file: ${fileName}`,
        });
      }

      return null;
    } finally {
      forgetAbortController(file);
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

  const cancelUpload = (file: File) => {
    store.get(agentChatUploadAbortControllersState.atom).get(file)?.abort();
  };

  const cancelAllUploads = () => {
    store
      .get(agentChatUploadAbortControllersState.atom)
      .forEach((abortController) => abortController.abort());
  };

  return { uploadFiles, cancelUpload, cancelAllUploads };
};
