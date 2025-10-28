import { AgentChatContextRecordPreview } from '@/ai/components/internal/AgentChatContextRecordPreview';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
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

export const AgentChatContextPreview = () => {
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] = useRecoilState(
    agentChatSelectedFilesState,
  );
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useRecoilState(
    agentChatUploadedFilesState,
  );

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
            contextStoreCurrentObjectMetadataItemId={
              contextStoreCurrentObjectMetadataItemId
            }
          />
        )}
      </StyledPreviewsContainer>
    </StyledContainer>
  );
};
