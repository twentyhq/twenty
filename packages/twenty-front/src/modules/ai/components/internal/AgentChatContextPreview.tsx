import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPreviewsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const AgentChatContextPreview = () => {
  const [agentChatSelectedFiles, setAgentChatSelectedFiles] = useAtomState(
    agentChatSelectedFilesState,
  );
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useAtomState(
    agentChatUploadedFilesState,
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
    <StyledPreviewsContainer>
      {agentChatSelectedFiles.map((file) => (
        <AgentChatFilePreview
          file={file}
          key={file.name}
          onRemove={() => {
            setAgentChatSelectedFiles(
              agentChatSelectedFiles.filter(
                (selectedFile) => selectedFile.name !== file.name,
              ),
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
  );
};
