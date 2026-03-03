import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledTableRow = styled('div', {
  shouldForwardProp: (prop) =>
    !['isSelected'].includes(prop) && isPropValid(prop),
})<{
  isSelected?: boolean;
  onClick?: () => void;
  to?: string;
  gridAutoColumns?: string;
  gridTemplateColumns?: string;
  mobileGridAutoColumns?: string;
}>`
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.accent.quaternary : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: grid;
  grid-auto-columns: ${({ gridAutoColumns }) => gridAutoColumns ?? '1fr'};
  ${({ gridTemplateColumns }) =>
    gridTemplateColumns
      ? `grid-template-columns: ${gridTemplateColumns};`
      : ''};

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
    background-color: ${({ onClick, to, theme }) =>
      onClick || to ? theme.background.transparent.light : 'transparent'};
    cursor: ${({ onClick, to }) => (onClick || to ? 'pointer' : 'default')};
  }

  &[data-clickable='true'] {
    cursor: pointer;
  }
`;

type TableRowProps = {
  isSelected?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  to?: string;
  className?: string;
  style?: React.CSSProperties;
  gridAutoColumns?: string;
  gridTemplateColumns?: string;
  mobileGridAutoColumns?: string;
};

export const TableRow = ({
  isSelected,
  isClickable,
  onClick,
  to,
  className,
  style,
  children,
  gridAutoColumns,
  gridTemplateColumns,
  mobileGridAutoColumns,
}: React.PropsWithChildren<TableRowProps>) => (
  <StyledTableRow
    isSelected={isSelected}
    onClick={onClick}
    gridAutoColumns={gridAutoColumns}
    gridTemplateColumns={gridTemplateColumns}
    className={className}
    style={style}
    data-clickable={isClickable}
    mobileGridAutoColumns={mobileGridAutoColumns}
    to={to}
    as={to ? Link : 'div'}
  >
    {children}
  </StyledTableRow>
);
