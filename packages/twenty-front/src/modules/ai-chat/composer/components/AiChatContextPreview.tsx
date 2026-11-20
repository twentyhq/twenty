import { ChatFilePreview } from '@/chat/components/ChatFilePreview';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatUploadingFilesFamilyState } from '@/ai-chat/composer/states/aiChatUploadingFilesFamilyState';
import { aiChatUploadedFilesFamilyState } from '@/ai-chat/composer/states/aiChatUploadedFilesFamilyState';
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
  const [aiChatUploadingFiles, setAiChatUploadingFiles] = useAtomFamilyState(
    aiChatUploadingFilesFamilyState,
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
    aiChatUploadingFiles.length > 0 || aiChatUploadedFiles.length > 0;

  if (!hasFiles) {
    return null;
  }

  return (
    <StyledPreviewsContainer>
      {aiChatUploadingFiles.map((file, index) => (
        <ChatFilePreview
          file={file}
          key={`${index}-${file.name}`}
          onRemove={() => {
            setAiChatUploadingFiles(
              aiChatUploadingFiles.filter(
                (selectedFile) => selectedFile !== file,
              ),
            );
          }}
          isUploading
        />
      ))}
      {aiChatUploadedFiles.map((file, index) => (
        <ChatFilePreview
          file={file}
          key={index}
          onRemove={() => handleRemoveUploadedFile(index)}
          isUploading={false}
        />
      ))}
    </StyledPreviewsContainer>
  );
};
