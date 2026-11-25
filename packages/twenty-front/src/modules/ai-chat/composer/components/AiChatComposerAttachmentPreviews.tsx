import { ChatFilePreview } from '@/chat/components/ChatFilePreview';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { aiChatComposerUploadingFilesFamilyState } from '@/ai-chat/composer/states/aiChatComposerUploadingFilesFamilyState';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/composer/states/aiChatComposerAttachmentsFamilyState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { ChatComposerAttachments } from '@/chat/components/ChatComposerAttachments';

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

  return (
    <ChatComposerAttachments>
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
    </ChatComposerAttachments>
  );
};
