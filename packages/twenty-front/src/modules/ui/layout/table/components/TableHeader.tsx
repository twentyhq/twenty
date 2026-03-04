import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTableHeader = styled.div<{
  align?: 'left' | 'center' | 'right';
  onClick?: () => void;
  padding?: string;
}>`
  gap: ${themeCssVariables.spacing[1]};
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${themeCssVariables.spacing[8]};
  justify-content: ${({ align }) =>
    align === 'right'
      ? 'flex-end'
      : align === 'center'
        ? 'center'
        : 'flex-start'};
  padding: ${({ padding }) => padding ?? `0 ${themeCssVariables.spacing[2]}`};
  text-align: ${({ align }) => align ?? 'left'};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
`;

export { StyledTableHeader as TableHeader };
