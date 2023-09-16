import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCheck } from '@/ui/icon';
import { ThemeColor } from '@/ui/theme/constants/colors';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { StyledMenuItemSelect } from './MenuItemSelect';

const StyledColorSample = styled.div<{ colorName: ThemeColor }>`
  background-color: ${({ theme, colorName }) =>
    theme.tag.background[colorName]};
  border: 1px solid ${({ theme, colorName }) => theme.color[colorName]};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 12px;
  width: 12px;
`;

type OwnProps = {
  selected: boolean;
  text: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  hovered?: boolean;
  color: ThemeColor;
};

export const MenuItemSelectColor = ({
  color,
  text,
  selected,
  className,
  onClick,
  disabled,
  hovered,
}: OwnProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemSelect
      onClick={onClick}
      className={className}
      selected={selected}
      disabled={disabled}
      hovered={hovered}
    >
      <StyledMenuItemLeftContent>
        <StyledColorSample colorName={color} />
        <StyledMenuItemLabel hasLeftIcon={true}>{text}</StyledMenuItemLabel>
      </StyledMenuItemLeftContent>
      {selected && <IconCheck size={theme.icon.size.sm} />}
    </StyledMenuItemSelect>
  );
};
