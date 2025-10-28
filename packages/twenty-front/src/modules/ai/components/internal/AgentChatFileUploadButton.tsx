import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import styled from '@emotion/styled';
import React, { useRef } from 'react';
import { useSetRecoilState } from 'recoil';
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

export const AgentChatFileUploadButton = () => {
  const setAgentChatSelectedFiles = useSetRecoilState(
    agentChatSelectedFilesState,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles } = useAIChatFileUpload();

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
