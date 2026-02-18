import { agentChatSelectedFilesStateV2 } from '@/ai/states/agentChatSelectedFilesStateV2';
import { agentChatUploadedFilesStateV2 } from '@/ai/states/agentChatUploadedFilesStateV2';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useLingui } from '@lingui/react/macro';
import { type FileUIPart } from 'ai';
import { buildSignedPath, isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  FileFolder,
  useUploadFileMutation,
} from '~/generated-metadata/graphql';

export const useAIChatFileUpload = () => {
  const coreClient = useApolloCoreClient();
  const [uploadFile] = useUploadFileMutation({ client: coreClient });
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] = useRecoilStateV2(
    agentChatSelectedFilesStateV2,
  );
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useRecoilStateV2(
    agentChatUploadedFilesStateV2,
  );

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
