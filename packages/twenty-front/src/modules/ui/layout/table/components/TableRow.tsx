import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { isDefined, MOBILE_VIEWPORT } from 'twenty-ui';

const StyledTableRow = styled('div', {
  shouldForwardProp: (prop) =>
    !['isSelected'].includes(prop) && isPropValid(prop),
})<{
  isSelected?: boolean;
  interactive: boolean;
  onClick?: () => void;
  to?: string;
  gridAutoColumns?: string;
  mobileGridAutoColumns?: string;
}>`
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.accent.quaternary : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: grid;
  grid-auto-columns: ${({ gridAutoColumns }) => gridAutoColumns ?? '1fr'};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-auto-columns: ${({ mobileGridAutoColumns, gridAutoColumns }) =>
      mobileGridAutoColumns ?? gridAutoColumns ?? '1fr'};
  }

  grid-auto-flow: column;
  transition: background-color
    ${({ theme }) => theme.animation.duration.normal}s;
  width: 100%;
  text-decoration: none;

  &:hover {
    background-color: ${({ interactive, theme }) =>
      interactive ? theme.background.transparent.light : 'transparent'};
    cursor: ${({ interactive }) => (interactive ? 'pointer' : 'default')};
  }
`;

type TableRowProps = {
  forceInteractive?: true;
  isSelected?: boolean;
  onClick?: () => void;
  to?: string;
  className?: string;
  gridAutoColumns?: string;
  mobileGridAutoColumns?: string;
};

export const TableRow = ({
  isSelected,
  onClick,
  to,
  forceInteractive,
  className,
  children,
  gridAutoColumns,
  mobileGridAutoColumns,
}: React.PropsWithChildren<TableRowProps>) => (
  <StyledTableRow
    isSelected={isSelected}
    onClick={onClick}
    gridAutoColumns={gridAutoColumns}
    className={className}
    mobileGridAutoColumns={mobileGridAutoColumns}
    interactive={
      isDefined(onClick) || isDefined(to) || forceInteractive === true
    }
    to={to}
    as={to ? Link : 'div'}
  >
    {children}
  </StyledTableRow>
);
