import { agentChatSelectedFilesStateV2 } from '@/ai/states/agentChatSelectedFilesStateV2';
import { agentChatUploadedFilesStateV2 } from '@/ai/states/agentChatUploadedFilesStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
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

export const AgentChatContextPreview = () => {
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] = useRecoilStateV2(
    agentChatSelectedFilesStateV2,
  );
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useRecoilStateV2(
    agentChatUploadedFilesStateV2,
  );

  const handleRemoveUploadedFile = (fileIndex: number) => {
    setAgentChatUploadedFiles(
      agentChatUploadedFiles.filter((_, index) => fileIndex !== index),
    );
  };

  const hasFiles =
    agentChatSelectedFiles.length > 0 || agentChatUploadedFiles.length > 0;

  if (!hasFiles) {
    return null;
  }

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
      </StyledPreviewsContainer>
    </StyledContainer>
  );
};
