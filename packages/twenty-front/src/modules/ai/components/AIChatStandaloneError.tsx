import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar, IconSparkles } from 'twenty-ui/display';

import { AIChatErrorRenderer } from '@/ai/components/AIChatErrorRenderer';

const StyledErrorContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledAvatarContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.blue};
  display: flex;
  justify-content: center;
  height: 24px;
  min-width: 24px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 1px;
`;

const StyledContent = styled.div`
  min-width: 0;
  width: 100%;
`;

type AIChatStandaloneErrorProps = {
  error: Error;
};

export const AIChatStandaloneError = ({
  error,
}: AIChatStandaloneErrorProps) => {
  const theme = useTheme();

  return (
    <StyledErrorContainer>
      <StyledAvatarContainer>
        <Avatar
          size="sm"
          placeholder="AI"
          Icon={IconSparkles}
          iconColor={theme.color.blue}
        />
      </StyledAvatarContainer>
      <StyledContent>
        <AIChatErrorRenderer error={error} />
      </StyledContent>
    </StyledErrorContainer>
  );
};
