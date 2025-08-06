import { AgentChatContextRecordPreview } from '@/ai/components/internal/AgentChatContextRecordPreview';
import { agentChatSelectedFilesComponentState } from '@/ai/states/agentChatSelectedFilesComponentState';
import { agentChatUploadedFilesComponentState } from '@/ai/states/agentChatUploadedFilesComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useDeleteFileMutation } from '~/generated-metadata/graphql';
import { AgentChatFilePreview } from './AgentChatFilePreview';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledPreviewsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const AgentChatContextPreview = ({ agentId }: { agentId: string }) => {
  const { t } = useLingui();
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] =
    useRecoilComponentState(agentChatSelectedFilesComponentState, agentId);
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] =
    useRecoilComponentState(agentChatUploadedFilesComponentState, agentId);

  const { enqueueErrorSnackBar } = useSnackBar();

  const [deleteFile] = useDeleteFileMutation();

  const handleRemoveUploadedFile = async (fileId: string) => {
    const originalFiles = agentChatUploadedFiles;

    setAgentChatUploadedFiles(
      agentChatUploadedFiles.filter((f) => f.id !== fileId),
    );

    try {
      await deleteFile({ variables: { fileId } });
    } catch (error) {
      setAgentChatUploadedFiles(originalFiles);
      enqueueErrorSnackBar({
        message: t`Failed to remove file`,
      });
    }
  };

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  return (
    <StyledContainer>
      <StyledPreviewsContainer>
        {agentChatSelectedFiles.map((file) => (
          <AgentChatFilePreview
            file={file}
            key={file.name}
            onRemove={() => {
              setAgentChatSelectedFiles(
                agentChatSelectedFiles.filter((f) => f.name !== file.name),
              );
            }}
            isUploading
          />
        ))}
        {agentChatUploadedFiles.map((file) => (
          <AgentChatFilePreview
            file={file}
            key={file.id}
            onRemove={() => handleRemoveUploadedFile(file.id)}
            isUploading={false}
          />
        ))}
        {contextStoreCurrentObjectMetadataItemId && (
          <AgentChatContextRecordPreview
            agentId={agentId}
            contextStoreCurrentObjectMetadataItemId={
              contextStoreCurrentObjectMetadataItemId
            }
          />
        )}
      </StyledPreviewsContainer>
    </StyledContainer>
  );
};
