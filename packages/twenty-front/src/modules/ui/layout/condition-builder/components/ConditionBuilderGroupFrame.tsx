import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div<{ isGrayBackground?: boolean }>`
  align-items: start;
  background-color: ${({ isGrayBackground }) =>
    isGrayBackground
      ? themeCssVariables.background.transparent.lighter
      : 'transparent'};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[2]};
`;

type ConditionBuilderGroupFrameProps = {
  isNested: boolean;
  children: ReactNode;
};

export const ConditionBuilderGroupFrame = ({
  isNested,
  children,
}: ConditionBuilderGroupFrameProps) => (
  <StyledContainer isGrayBackground={isNested}>{children}</StyledContainer>
);
