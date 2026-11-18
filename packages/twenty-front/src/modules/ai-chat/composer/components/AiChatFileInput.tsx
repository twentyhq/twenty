import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useAiChatFileUpload } from '@/ai-chat/composer/hooks/useAiChatFileUpload';
import { styled } from '@linaria/react';
import { type ChangeEvent, type Ref } from 'react';

const StyledFileInput = styled.input`
  display: none;
`;

type AiChatFileInputProps = {
  ref: Ref<HTMLInputElement>;
};

export const AiChatFileInput = ({ ref }: AiChatFileInputProps) => {
  const { uploadFiles } = useAiChatFileUpload();
  const { threadId } = useAiChatInstanceOrThrow();

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const files = Array.from(event.target.files);

    uploadFiles({ files, threadId });
    event.target.value = '';
  };

  return (
    <StyledFileInput
      ref={ref}
      type="file"
      multiple
      accept="*/*"
      onChange={handleFileInputChange}
    />
  );
};
