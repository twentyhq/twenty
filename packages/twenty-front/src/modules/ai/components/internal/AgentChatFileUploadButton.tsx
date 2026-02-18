import { useAIChatFileUpload } from '@/ai/hooks/useAIChatFileUpload';
import { agentChatSelectedFilesStateV2 } from '@/ai/states/agentChatSelectedFilesStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import React, { useRef } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledFileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFileInput = styled.input`
  display: none;
`;

export const AgentChatFileUploadButton = () => {
  const setAgentChatSelectedFiles = useSetRecoilStateV2(
    agentChatSelectedFilesStateV2,
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

      <IconButton
        variant="tertiary"
        size="small"
        onClick={() => {
          fileInputRef.current?.click();
        }}
        Icon={IconPlus}
        ariaLabel={t`Attach files`}
      />
    </StyledFileUploadContainer>
  );
};
