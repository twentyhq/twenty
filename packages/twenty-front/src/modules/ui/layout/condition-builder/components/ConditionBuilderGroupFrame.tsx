import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: start;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[2]};
`;

type ConditionBuilderGroupFrameProps = {
  children: ReactNode;
};

export const ConditionBuilderGroupFrame = ({
  children,
}: ConditionBuilderGroupFrameProps) => (
  <StyledContainer>{children}</StyledContainer>
);
