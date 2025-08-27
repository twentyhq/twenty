import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { agentChatSelectedFilesComponentState } from '@/ai/states/agentChatSelectedFilesComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import React, { useRef } from 'react';
import { IconPaperclip } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledFileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileInput = styled.input`
  display: none;
`;

export const AgentChatFileUploadButton = ({ agentId }: { agentId: string }) => {
  const setAgentChatSelectedFiles = useSetRecoilComponentState(
    agentChatSelectedFilesComponentState,
    agentId,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles } = useAIChatFileUpload({ agentId });

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files) {
      return;
    }

    uploadFiles(Array.from(event.target.files));
    setAgentChatSelectedFiles(Array.from(event.target.files));
  };

  return (
    <StyledFileUploadContainer>
      <StyledFileInput
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        onChange={handleFileInputChange}
      />

      <Button
        variant="secondary"
        size="small"
        onClick={() => {
          fileInputRef.current?.click();
        }}
        Icon={IconPaperclip}
      />
    </StyledFileUploadContainer>
  );
};
