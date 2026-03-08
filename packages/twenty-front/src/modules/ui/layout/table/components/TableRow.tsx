import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTableRow = styled.div<{
  isSelected?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
  to?: string;
  gridAutoColumns?: string;
  gridTemplateColumns?: string;
  mobileGridAutoColumns?: string;
  height?: string;
  cursor?: string;
  hoverBackgroundColor?: string;
}>`
  background-color: ${({ isSelected, isExpanded }) =>
    isSelected
      ? themeCssVariables.accent.quaternary
      : isExpanded === true
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ cursor }) => cursor ?? 'default'};
  display: grid;
  grid-auto-columns: ${({ gridAutoColumns }) => gridAutoColumns ?? '1fr'};
  grid-auto-flow: column;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-auto-columns: ${({ mobileGridAutoColumns, gridAutoColumns }) =>
      mobileGridAutoColumns ?? gridAutoColumns ?? '1fr'};
  }

  grid-template-columns: ${({ gridTemplateColumns }) =>
    gridTemplateColumns ?? 'none'};
  height: ${({ height }) => height ?? 'auto'};
  text-decoration: none;
  transition: background-color
    calc(${themeCssVariables.animation.duration.normal} * 1s);
  width: 100%;

  &:hover {
    background-color: ${({ onClick, to, hoverBackgroundColor }) =>
      hoverBackgroundColor ??
      (onClick || to
        ? themeCssVariables.background.transparent.light
        : 'transparent')};
    cursor: ${({ onClick, to, cursor }) =>
      cursor ?? (onClick || to ? 'pointer' : 'default')};
  }

  &[data-clickable='true'] {
    cursor: pointer;
  }
`;

type TableRowProps = {
  isSelected?: boolean;
  isExpanded?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  to?: string;
  className?: string;
  style?: React.CSSProperties;
  gridAutoColumns?: string;
  gridTemplateColumns?: string;
  mobileGridAutoColumns?: string;
  height?: string;
  cursor?: string;
  hoverBackgroundColor?: string;
};

export const TableRow = ({
  isSelected,
  isExpanded,
  isClickable,
  onClick,
  to,
  className,
  style,
  children,
  gridAutoColumns,
  gridTemplateColumns,
  mobileGridAutoColumns,
  height,
  cursor,
  hoverBackgroundColor,
}: React.PropsWithChildren<TableRowProps>) => (
  <StyledTableRow
    isSelected={isSelected}
    isExpanded={isExpanded}
    onClick={onClick}
    gridAutoColumns={gridAutoColumns}
    gridTemplateColumns={gridTemplateColumns}
    className={className}
    style={style}
    data-clickable={isClickable}
    mobileGridAutoColumns={mobileGridAutoColumns}
    height={height}
    cursor={cursor}
    hoverBackgroundColor={hoverBackgroundColor}
    to={to}
    as={to ? Link : 'div'}
  >
    {children}
  </StyledTableRow>
);
