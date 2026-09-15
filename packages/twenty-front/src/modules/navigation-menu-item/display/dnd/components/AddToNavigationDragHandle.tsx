import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { styled } from '@linaria/react';
import { useContext, type ReactNode } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { TintedIconTile } from 'twenty-ui/primitives/data-display';
import { IconGripVertical, type IconComponent } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import type { AddToNavigationDragPayload } from '@/navigation-menu-item/common/types/add-to-navigation-drag-payload';
import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';

const StyledIconSlot = styled.div<{
  $hasFixedSize: boolean;
  $disabled?: boolean;
  $disableDrag?: boolean;
}>`
  align-items: center;
  cursor: ${({ $disabled, $disableDrag }) =>
    $disabled || $disableDrag ? 'default' : 'grab'};
  display: flex;
  flex-shrink: 0;
  height: ${({ $hasFixedSize }) =>
    $hasFixedSize ? themeCssVariables.spacing[4] : 'auto'};
  justify-content: center;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  width: ${({ $hasFixedSize }) =>
    $hasFixedSize ? themeCssVariables.spacing[4] : 'auto'};

  &:active {
    cursor: ${({ $disabled, $disableDrag }) =>
      $disabled || $disableDrag ? 'default' : 'grabbing'};
  }
`;

type AddToNavigationDragHandleProps = {
  icon?: IconComponent;
  customIconContent?: ReactNode;
  payload: AddToNavigationDragPayload;
  isHovered: boolean;
  disabled?: boolean;
  disableDrag?: boolean;
};

export const AddToNavigationDragHandle = ({
  icon,
  customIconContent,
  payload,
  isHovered,
  disabled = false,
  disableDrag = false,
}: AddToNavigationDragHandleProps) => {
  const { theme } = useContext(ThemeContext);
  const effectiveColor = getNavigationMenuItemColor(
    { type: payload.type as NavigationMenuItemType },
    payload.type === NavigationMenuItemType.OBJECT && payload.iconColor
      ? {
          nameSingular: '',
          color: payload.iconColor,
          isSystem: false,
        }
      : undefined,
  );
  const hasFixedIconSize =
    payload.type !== NavigationMenuItemType.RECORD && !isHovered;
  const renderIcon = () => {
    if (isHovered) {
      return (
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.tertiary}
        />
      );
    }

    if (isDefined(customIconContent)) {
      return customIconContent;
    }

    if (!isDefined(icon)) {
      return null;
    }

    const Icon = icon;

    if (payload.type === NavigationMenuItemType.VIEW) {
      return <TintedIconTile Icon={Icon} color={effectiveColor} />;
    }

    if (payload.type === NavigationMenuItemType.RECORD) {
      return (
        <Icon
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.grayScale.gray1}
        />
      );
    }

    return <ColoredIcon Icon={Icon} color={effectiveColor} />;
  };

  return (
    <StyledIconSlot
      $hasFixedSize={hasFixedIconSize || isDefined(customIconContent)}
      $disabled={disabled}
      $disableDrag={disableDrag}
    >
      {renderIcon()}
    </StyledIconSlot>
  );
};
