import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconAlertCircle } from 'twenty-ui/display';
import { useContext } from 'react';

import { type AiChatError } from '@/ai/types/AiChatError';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

const StyledErrorContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.danger};
  border: 1px solid ${themeCssVariables.border.color.danger};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledErrorIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.red};
  display: flex;
`;

const StyledErrorContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledErrorTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  word-break: break-word;
`;

type AiChatErrorMessageProps = {
  error: AiChatError;
};

export const AiChatErrorMessage = ({ error }: AiChatErrorMessageProps) => {
  const { theme } = useContext(ThemeContext);
  const errorMessage = CombinedGraphQLErrors.is(error)
    ? getErrorMessageFromApolloError(error)
    : error.message;

  return (
    <StyledErrorContainer>
      <StyledErrorIcon>
        <IconAlertCircle size={theme.icon.size.md} />
      </StyledErrorIcon>
      <StyledErrorContent>
        <StyledErrorTitle>{t`Failed to get response`}</StyledErrorTitle>
        <StyledErrorMessage>
          {errorMessage || t`An error occurred while processing your message`}
        </StyledErrorMessage>
      </StyledErrorContent>
    </StyledErrorContainer>
  );
};
