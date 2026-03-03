import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTableRow = styled.div<{
  isSelected?: boolean;
  onClick?: () => void;
  to?: string;
  gridAutoColumns?: string;
  gridTemplateColumns?: string;
  mobileGridAutoColumns?: string;
}>`
  background-color: ${({ isSelected }) =>
    isSelected ? themeCssVariables.accent.quaternary : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
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
    calc(${themeCssVariables.animation.duration.normal} * 1s);
  width: 100%;
  text-decoration: none;

  &:hover {
    background-color: ${({ onClick, to }) =>
      onClick || to
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
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
