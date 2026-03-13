import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconGripVertical, type IconComponent } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorFolder';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorLink';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';

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

type AddToNavigationDragHandleIconProps = {
  icon?: IconComponent;
  customIconContent?: ReactNode;
  iconColor?: string;
};

const AddToNavigationDragHandleIcon = ({
  icon,
  customIconContent,
  iconColor,
}: AddToNavigationDragHandleIconProps) => {
  const { theme } = useContext(ThemeContext);
  const iconSize = theme.icon.size.md;
  const iconStroke = theme.icon.stroke.sm;

  if (isDefined(customIconContent)) {
    return <>{customIconContent}</>;
  }

  if (isDefined(icon)) {
    const Icon = icon;
    return (
      <Icon
        size={iconSize}
        stroke={iconStroke}
        color={iconColor ?? theme.grayScale.gray1}
      />
    );
  }
};

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
  const effectiveColor =
    payload.type === 'object' && isNonEmptyString(payload.iconColor)
      ? payload.iconColor
      : payload.type === 'folder'
        ? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER
        : payload.type === 'link'
          ? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_LINK
          : undefined;
  const hasBackgroundColor =
    payload.type !== NavigationMenuItemType.RECORD &&
    isDefined(effectiveColor) &&
    !isHovered;
  const showCustomContentWithoutWrapper = isDefined(customIconContent);

  return (
    <StyledIconSlot
      $hasFixedSize={hasBackgroundColor || showCustomContentWithoutWrapper}
      $disabled={disabled}
      $disableDrag={disableDrag}
    >
      {isHovered ? (
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.tertiary}
        />
      ) : showCustomContentWithoutWrapper ? (
        customIconContent
      ) : hasBackgroundColor && icon ? (
        <NavigationMenuItemStyleIcon Icon={icon} color={effectiveColor} />
      ) : (
        <AddToNavigationDragHandleIcon
          icon={icon}
          customIconContent={customIconContent}
        />
      )}
    </StyledIconSlot>
  );
};
