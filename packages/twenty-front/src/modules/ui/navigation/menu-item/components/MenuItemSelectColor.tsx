import { useTheme } from '@emotion/react';
import {
  ColorSample,
  ColorSampleVariant,
  IconCheck,
  ThemeColor,
} from 'twenty-ui';

import {
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { StyledMenuItemSelect } from './MenuItemSelect';

type MenuItemSelectColorProps = {
  selected: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  hovered?: boolean;
  color: ThemeColor;
  variant?: ColorSampleVariant;
};

export const colorLabels: Record<ThemeColor, string> = {
  green: 'Verde',
  turquoise: 'Turquesa',
  sky: 'Céu',
  blue: 'Azul',
  purple: 'Roxo',
  pink: 'Rosa',
  red: 'Vermelho',
  orange: 'Laranja',
  yellow: 'Amarelo',
  gray: 'Cinza',
};

export const MenuItemSelectColor = ({
  color,
  selected,
  className,
  onClick,
  disabled,
  hovered,
  variant = 'default',
}: MenuItemSelectColorProps) => {
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
        <ColorSample colorName={color} variant={variant} />
        <StyledMenuItemLabel hasLeftIcon={true}>
          {colorLabels[color]}
        </StyledMenuItemLabel>
      </StyledMenuItemLeftContent>
      {selected && <IconCheck size={theme.icon.size.md} />}
    </StyledMenuItemSelect>
  );
};
