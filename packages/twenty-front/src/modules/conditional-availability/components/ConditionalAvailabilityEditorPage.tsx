import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

type ConditionalAvailabilityEditorPageProps = {
  children: ReactNode;
};

export const ConditionalAvailabilityEditorPage = ({
  children,
}: ConditionalAvailabilityEditorPageProps) => (
  <StyledContainer>{children}</StyledContainer>
);
