import { styled } from '@linaria/react';
import { type ComponentPropsWithoutRef, type Ref, forwardRef } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type TableHeaderProps = Omit<ComponentPropsWithoutRef<'div'>, 'onClick'> & {
  align?: 'left' | 'center' | 'right';
  onClick?: () => void;
  padding?: string;
};

const StyledTableHeader = styled.div<TableHeaderProps>`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start'};
  padding: ${({ padding }) => padding ?? `0 ${themeCssVariables.spacing[2]}`};
  text-align: ${({ align }) => align ?? 'left'};
`;

export const TableHeader = forwardRef(
  (props: TableHeaderProps, ref: Ref<HTMLDivElement>) => (
    <StyledTableHeader
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
      ref={ref}
      data-table-header
    />
  ),
);
