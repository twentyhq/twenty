import { extractErrorMessage } from '@/ai/utils/extractErrorMessage';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconAlertCircle } from 'twenty-ui/display';

const StyledContainer = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.color.red10};
  border: 1px solid ${({ theme }) => theme.color.red20};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-block: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.color.red60};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
`;

const StyledContent = styled.div`
  flex: 1;
`;

const StyledTitle = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.color.red80};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledMessage = styled.div`
  color: ${({ theme }) => theme.color.red70};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

export const ErrorStepRenderer = ({
  message,
  error,
}: {
  message: string;
  error?: unknown;
}) => {
  const theme = useTheme();
  const errorMessage = error ? extractErrorMessage(error) : message;

  return (
    <StyledContainer>
      <StyledIconContainer>
        <IconAlertCircle size={theme.icon.size.md} />
      </StyledIconContainer>
      <StyledContent>
        <StyledTitle>Error</StyledTitle>
        <StyledMessage>{errorMessage}</StyledMessage>
      </StyledContent>
    </StyledContainer>
  );
};
