import { AgentChatContextRecordPreview } from '@/ai/components/internal/AgentChatContextRecordPreview';
import { agentChatSelectedFilesComponentState } from '@/ai/states/agentChatSelectedFilesComponentState';
import { agentChatUploadedFilesComponentState } from '@/ai/states/agentChatUploadedFilesComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
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
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] =
    useRecoilComponentState(agentChatSelectedFilesComponentState, agentId);
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] =
    useRecoilComponentState(agentChatUploadedFilesComponentState, agentId);

  const handleRemoveUploadedFile = async (fileIndex: number) => {
    setAgentChatUploadedFiles(
      agentChatUploadedFiles.filter((f, index) => fileIndex !== index),
    );
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
        {agentChatUploadedFiles.map((file, index) => (
          <AgentChatFilePreview
            file={file}
            key={index}
            onRemove={() => handleRemoveUploadedFile(index)}
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
