import { agentChatSelectedFilesComponentState } from '@/ai/states/agentChatSelectedFilesComponentState';
import { agentChatUploadedFilesComponentState } from '@/ai/states/agentChatUploadedFilesComponentState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
import { type FileUIPart } from 'ai';
import { buildSignedPath, isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useUploadFileMutation } from '~/generated-metadata/graphql';
import { FileFolder } from '~/generated/graphql';

export const useAIChatFileUpload = ({ agentId }: { agentId: string }) => {
  const coreClient = useApolloCoreClient();
  const [uploadFile] = useUploadFileMutation({ client: coreClient });
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] =
    useRecoilComponentState(agentChatSelectedFilesComponentState, agentId);
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] =
    useRecoilComponentState(agentChatUploadedFilesComponentState, agentId);

  const sendFile = async (file: File): Promise<FileUIPart | null> => {
    try {
      const result = await uploadFile({
        variables: {
          file,
          fileFolder: FileFolder.AgentChat,
        },
      });

      const response = result?.data?.uploadFile;

      if (!isDefined(response)) {
        throw new Error(t`Couldn't upload the file.`);
      }

      const signedPath = buildSignedPath({
        path: response.path,
        token: response.token,
      });

      setAgentChatSelectedFiles(
        agentChatSelectedFiles.filter((f) => f.name !== file.name),
      );
      return {
        filename: file.name,
        mediaType: file.type,
        url: `${REACT_APP_SERVER_BASE_URL}/files/${signedPath}`,
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

    const successfulUploads = uploadResults.reduce<FileUIPart[]>(
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
