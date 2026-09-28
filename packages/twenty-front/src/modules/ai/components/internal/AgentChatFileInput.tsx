import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { type ChangeEvent, type Ref } from 'react';

const StyledFileInput = styled.input`
  display: none;
`;

type AgentChatFileInputProps = {
  ref: Ref<HTMLInputElement>;
};

export const AgentChatFileInput = ({ ref }: AgentChatFileInputProps) => {
  const setAgentChatSelectedFiles = useSetAtomState(
    agentChatSelectedFilesState,
  );
  const { uploadFiles } = useAiChatFileUpload();

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    uploadFiles(Array.from(event.target.files));
    setAgentChatSelectedFiles(Array.from(event.target.files));
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
