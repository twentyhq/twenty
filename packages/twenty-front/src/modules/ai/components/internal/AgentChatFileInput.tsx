import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { styled } from '@linaria/react';
import { type ChangeEvent, type Ref } from 'react';

const StyledFileInput = styled.input`
  display: none;
`;

type AgentChatFileInputProps = {
  ref: Ref<HTMLInputElement>;
};

export const AgentChatFileInput = ({ ref }: AgentChatFileInputProps) => {
  const { uploadFiles } = useAiChatFileUpload();

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const files = Array.from(event.target.files);

    uploadFiles(files);
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
