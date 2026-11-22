import { ChatFilePreview } from '@/chat/components/ChatFilePreview';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatComposerUploadingFilesFamilyState } from '@/ai-chat/composer/states/aiChatComposerUploadingFilesFamilyState';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/composer/states/aiChatComposerAttachmentsFamilyState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPreviewsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const AiChatComposerAttachmentPreviews = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const [aiChatComposerUploadingFiles, setAiChatComposerUploadingFiles] =
    useAtomFamilyState(aiChatComposerUploadingFilesFamilyState, { threadId });
  const [aiChatComposerAttachments, setAiChatComposerAttachments] =
    useAtomFamilyState(aiChatComposerAttachmentsFamilyState, { threadId });

  const handleRemoveUploadedFile = (fileIndex: number) => {
    setAiChatComposerAttachments(
      aiChatComposerAttachments.filter((_, index) => fileIndex !== index),
    );
  };

  const hasFiles =
    aiChatComposerUploadingFiles.length > 0 ||
    aiChatComposerAttachments.length > 0;

  if (!hasFiles) {
    return null;
  }

  return (
    <StyledPreviewsContainer>
      {aiChatComposerUploadingFiles.map((file, index) => (
        <ChatFilePreview
          file={file}
          key={`${index}-${file.name}`}
          onRemove={() => {
            setAiChatComposerUploadingFiles(
              aiChatComposerUploadingFiles.filter(
                (selectedFile) => selectedFile !== file,
              ),
            );
          }}
          isUploading
        />
      ))}
      {aiChatComposerAttachments.map((file, index) => (
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
