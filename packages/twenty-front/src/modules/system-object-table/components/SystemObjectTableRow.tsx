import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.div<{ isClickable: boolean }>`
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  display: flex;
  flex-direction: row;
  position: relative;

  @media (hover: hover) {
    &:hover {
      background-color: ${themeCssVariables.background.transparent.light};
    }
  }
`;

export const SystemObjectTableRow = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) => (
  <StyledRow isClickable={onClick !== undefined} onClick={onClick}>
    {children}
  </StyledRow>
);
