import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.span`
  align-items: center;
  display: inline-flex;
  padding: ${themeCssVariables.spacing[1]};

  &[data-background='light'] {
    background: ${themeCssVariables.background.transparent.light};
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

type ListItemIconContainerProps = {
  children: ReactNode;
  background?: 'light' | 'none';
};

export const ListItemIconContainer = ({
  children,
  background = 'light',
}: ListItemIconContainerProps) => (
  <StyledContainer data-background={background}>{children}</StyledContainer>
);
