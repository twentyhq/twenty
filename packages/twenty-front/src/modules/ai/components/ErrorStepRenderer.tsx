import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { IconAlertCircle } from 'twenty-ui/display';

const StyledContainer = styled.div`
  align-items: flex-start;
  background-color: ${({ theme }) => theme.color.red10};
  border: 1px solid ${({ theme }) => theme.color.red20};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(2)} 0;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.color.red60};
  flex-shrink: 0;
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

const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (isDefined(error) && typeof error === 'object') {
    // Handle Anthropic API error format
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    // Handle nested error objects (error.error.message)
    if (
      'error' in error &&
      isDefined(error.error) &&
      typeof error.error === 'object'
    ) {
      if ('message' in error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    // Handle deeply nested error objects (error.data.error.message)
    if (
      'data' in error &&
      isDefined(error.data) &&
      typeof error.data === 'object' &&
      'error' in error.data &&
      isDefined(error.data.error) &&
      typeof error.data.error === 'object' &&
      'message' in error.data.error &&
      typeof error.data.error.message === 'string'
    ) {
      return error.data.error.message;
    }
  }

  return 'An unexpected error occurred';
};

type ErrorStepRendererProps = {
  message: string;
  error?: unknown;
};

export const ErrorStepRenderer = ({
  message,
  error,
}: ErrorStepRendererProps) => {
  const errorMessage = error ? extractErrorMessage(error) : message;

  return (
    <StyledContainer>
      <StyledIconContainer>
        <IconAlertCircle size={20} />
      </StyledIconContainer>
      <StyledContent>
        <StyledTitle>Error</StyledTitle>
        <StyledMessage>{errorMessage}</StyledMessage>
      </StyledContent>
    </StyledContainer>
  );
};
