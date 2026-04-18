import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatFileUIPart } from '@/ai/types/agent-chat-file-ui-part.type';
import { UploadAiChatFileDocument } from '~/generated-metadata/graphql';

export const useAiChatFileUpload = () => {
  const apolloClient = useApolloClient();
  const [uploadAiChatFile] = useMutation(UploadAiChatFileDocument, {
    client: apolloClient,
  });
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] = useAtomState(
    agentChatSelectedFilesState,
  );
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useAtomState(
    agentChatUploadedFilesState,
  );

  const sendFile = async (file: File): Promise<AgentChatFileUIPart | null> => {
    try {
      const result = await uploadAiChatFile({
        variables: {
          file,
        },
      });

      const response = result?.data?.uploadAiChatFile;

      if (!isDefined(response)) {
        throw new Error(t`Couldn't upload the file.`);
      }

      setAgentChatSelectedFiles(
        agentChatSelectedFiles.filter((f) => f.name !== file.name),
      );
      return {
        filename: file.name,
        mediaType: file.type,
        url: response.url,
        fileId: response.id,
        type: 'file',
      };
    } catch {
      const fileName = file.name;
      enqueueErrorSnackBar({
        message: t`Failed to upload file: ${fileName}`,
      });
      return null;
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

    if (successfulUploads.length > 0) {
      setAgentChatUploadedFiles([
        ...agentChatUploadedFiles,
        ...successfulUploads,
      ]);
    }

    const failedCount = uploadResults.filter(
      (result) => result.status === 'rejected',
    ).length;
    if (failedCount > 0) {
      enqueueErrorSnackBar({
        message: t`${failedCount} file(s) failed to upload`,
      });
    }
  };

  return { uploadFiles };
};
