import { Link } from 'react-router-dom';
import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';

const StyledTableRow = styled('div', {
  shouldForwardProp: (prop) =>
    !['isSelected'].includes(prop) && isPropValid(prop),
})<{
  isSelected?: boolean;
  onClick?: () => void;
  to?: string;
}>`
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.accent.quaternary : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  transition: background-color
    ${({ theme }) => theme.animation.duration.normal}s;
  width: 100%;
  text-decoration: none;

  &:hover {
    background-color: ${({ onClick, to, theme }) =>
      onClick || to ? theme.background.transparent.light : 'transparent'};
    cursor: ${({ onClick, to }) => (onClick || to ? 'pointer' : 'default')};
  }
`;

type TableRowProps = {
  isSelected?: boolean;
  onClick?: () => void;
  to?: string;
  className?: string;
};

export const TableRow = ({
  isSelected,
  onClick,
  to,
  className,
  children,
}: React.PropsWithChildren<TableRowProps>) => (
  <StyledTableRow
    isSelected={isSelected}
    onClick={onClick}
    className={className}
    to={to}
    as={to ? Link : 'div'}
  >
    {children}
  </StyledTableRow>
);
