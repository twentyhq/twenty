import { AiChatFilePreview } from '@/ai/components/internal/AiChatFilePreview';
import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { aiChatSelectedFilesFamilyState } from '@/ai/states/aiChatSelectedFilesFamilyState';
import { aiChatUploadedFilesFamilyState } from '@/ai/states/aiChatUploadedFilesFamilyState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPreviewsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const AiChatContextPreview = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const [aiChatSelectedFiles, setAiChatSelectedFiles] = useAtomFamilyState(
    aiChatSelectedFilesFamilyState,
    { threadId },
  );
  const [aiChatUploadedFiles, setAiChatUploadedFiles] = useAtomFamilyState(
    aiChatUploadedFilesFamilyState,
    { threadId },
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
