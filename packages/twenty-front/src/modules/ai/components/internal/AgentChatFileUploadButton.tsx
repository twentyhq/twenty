import { AgentChatFileInput } from '@/ai/components/internal/AgentChatFileInput';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useRef } from 'react';
import { IconPaperclip } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFileUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const AgentChatFileUploadButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <StyledFileUploadContainer>
      <AgentChatFileInput ref={fileInputRef} />

      <IconButton
        variant="ghost"
        size="sm"
        onClick={() => {
          fileInputRef.current?.click();
        }}
        aria-label={t`Attach files`}
      >
        <IconPaperclip />
      </IconButton>
    </StyledFileUploadContainer>
  );
};
