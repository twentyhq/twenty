import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { agentChatSelectedFilesComponentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/agentChatSelectedFilesComponentState';
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

export const AgentChatFileUpload = ({ agentId }: { agentId: string }) => {
  const [, setAgentChatSelectedFiles] = useRecoilComponentStateV2(
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
