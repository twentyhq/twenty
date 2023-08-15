import { ComponentProps } from 'react';
import styled from '@emotion/styled';

import {
  IconButtonGroup,
  type IconButtonGroupProps,
} from '@/ui/button/components/IconButtonGroup';
import { hoverBackground } from '@/ui/theme/constants/effects';

const styledIconButtonGroupClassName = 'dropdown-menu-item-actions';

export type DropdownMenuItemAccent = 'regular' | 'danger';

const StyledItem = styled.li<{ accent: DropdownMenuItemAccent }>`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};

  align-items: center;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, accent }) =>
    accent === 'danger' ? theme.color.red : theme.font.color.secondary};

  cursor: pointer;
  display: flex;
  flex-direction: row;

  font-size: ${({ theme }) => theme.font.size.sm};

  gap: ${({ theme }) => theme.spacing(2)};

  height: calc(32px - 2 * var(--vertical-padding));

  padding: var(--vertical-padding) var(--horizontal-padding);

  ${hoverBackground};

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));

  &:hover {
    .${styledIconButtonGroupClassName} {
      display: flex;
    }
  }
`;

const StyledActions = styled(IconButtonGroup)`
  display: none;
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
`;

export type DropdownMenuItemProps = ComponentProps<'li'> & {
  actions?: IconButtonGroupProps['children'];
  accent?: DropdownMenuItemAccent;
};

export const DropdownMenuItem = ({
  actions,
  children,
  accent = 'regular',
  ...props
}: DropdownMenuItemProps) => (
  <StyledItem {...props} accent={accent}>
    {children}
    {actions && (
      <StyledActions
        className={styledIconButtonGroupClassName}
        variant="transparent"
        size="small"
      >
        {actions}
      </StyledActions>
    )}
  </StyledItem>
);
