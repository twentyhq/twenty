import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { agentChatUploadedFilesComponentState } from '@/ai/states/agentChatUploadedFilesComponentState';
import styled from '@emotion/styled';
import { AgentChatFilePreview } from './AgentChatFilePreview';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { agentChatSelectedFilesComponentState } from '@/ai/states/agentChatSelectedFilesComponentState';
import { useDeleteFileMutation } from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AgentChatContextRecordPreview } from '@/ai/components/internal/AgentChatContextRecordPreview';

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
    useRecoilComponentStateV2(agentChatSelectedFilesComponentState, agentId);
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] =
    useRecoilComponentStateV2(agentChatUploadedFilesComponentState, agentId);

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

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
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
