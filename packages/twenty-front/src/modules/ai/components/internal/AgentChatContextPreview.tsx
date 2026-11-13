import { AiChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { aiChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { aiChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPreviewsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const AiChatContextPreview = () => {
  const [aiChatSelectedFiles, setAiChatSelectedFiles] = useAtomState(
    aiChatSelectedFilesState,
  );
  const [aiChatUploadedFiles, setAiChatUploadedFiles] = useAtomState(
    aiChatUploadedFilesState,
  );

  const handleRemoveUploadedFile = (fileIndex: number) => {
    setAiChatUploadedFiles(
      aiChatUploadedFiles.filter((_, index) => fileIndex !== index),
    );
  };

  const hasFiles =
    aiChatSelectedFiles.length > 0 || aiChatUploadedFiles.length > 0;

  if (!hasFiles) {
    return null;
  }

  return (
    <StyledPreviewsContainer>
      {aiChatSelectedFiles.map((file, index) => (
        <AiChatFilePreview
          file={file}
          key={`${index}-${file.name}`}
          onRemove={() => {
            setAiChatSelectedFiles(
              aiChatSelectedFiles.filter(
                (selectedFile) => selectedFile !== file,
              ),
            );
          }}
          isUploading
        />
      ))}
      {aiChatUploadedFiles.map((file, index) => (
        <AiChatFilePreview
          file={file}
          key={index}
          onRemove={() => handleRemoveUploadedFile(index)}
          isUploading={false}
        />
      ))}
    </StyledPreviewsContainer>
  );
};
