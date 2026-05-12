import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import React, { useRef } from 'react';
import { IconPaperclip } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFileInput = styled.input`
  display: none;
`;

export const AgentChatFileUploadButton = () => {
  const setAgentChatSelectedFiles = useSetAtomState(
    agentChatSelectedFilesState,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles } = useAiChatFileUpload();

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

      <IconButton
        variant="tertiary"
        size="small"
        onClick={() => {
          fileInputRef.current?.click();
        }}
        Icon={IconPaperclip}
        ariaLabel={t`Attach files`}
      />
    </StyledFileUploadContainer>
  );
};
