import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  padding-left: calc(
    ${themeCssVariables.icon.size.sm} * 1px + ${themeCssVariables.spacing[2]}
  );
`;

type AiChatAskDetailsProps = {
  children: ReactNode;
};

export const AiChatAskDetails = ({ children }: AiChatAskDetailsProps) => (
  <StyledContainer>{children}</StyledContainer>
);
