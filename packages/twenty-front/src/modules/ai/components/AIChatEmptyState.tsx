import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconSparkles } from 'twenty-ui/display';
const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const StyledSparkleIcon = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2.5)};
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: 600;
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
  max-width: 85%;
  font-size: ${({ theme }) => theme.font.size.md};
`;

export const AIChatEmptyState = () => {
  const theme = useTheme();

  return (
    <StyledEmptyState>
      <StyledSparkleIcon>
        <IconSparkles size={theme.icon.size.lg} color={theme.color.blue} />
      </StyledSparkleIcon>
      <StyledTitle>{t`Chat`}</StyledTitle>
      <StyledDescription>
        {t`Start a conversation with your AI agent to get workflow insights, task assistance, and process guidance`}
      </StyledDescription>
    </StyledEmptyState>
  );
};
