import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';

import { type AgentChatFileUIPart } from '@/ai/types/agent-chat-file-ui-part.type';
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

  const sendFile = async (file: File): Promise<AgentChatFileUIPart | null> => {
    try {
      const uploadedFile = await directUploadFile(file, {
        fileFolder: FileFolder.AgentChat,
      });

      return {
        filename: file.name,
        mediaType: file.type,
        url: uploadedFile.url,
        fileId: uploadedFile.id,
        type: 'file',
      };
    } catch {
      const fileName = file.name;
      enqueueToast({
        variant: 'error',
        children: t`Failed to upload file: ${fileName}`,
      });
      return null;
    } finally {
      setAgentChatSelectedFiles((previousSelectedFiles) =>
        previousSelectedFiles.filter(
          (selectedFile) => selectedFile.name !== file.name,
        ),
      );
    }
  };

  const uploadFiles = async (files: File[]) => {
    const uploadResults = await Promise.allSettled(
      files.map((file) => sendFile(file)),
    );

    const successfulUploads = uploadResults.reduce<AgentChatFileUIPart[]>(
      (acc, result) => {
        if (result.status === 'fulfilled' && isDefined(result.value)) {
          acc.push(result.value);
        }
        return acc;
      },
      [],
    );

    if (isNonEmptyArray(successfulUploads)) {
      setAgentChatUploadedFiles((previousUploadedFiles) => [
        ...previousUploadedFiles,
        ...successfulUploads,
      ]);
    }

    const failedCount = uploadResults.filter(
      (result) => result.status === 'rejected',
    ).length;
    if (failedCount > 0) {
      enqueueToast({
        variant: 'error',
        children: t`${failedCount} file(s) failed to upload`,
      });
    }
  };

  return { uploadFiles };
};
