import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconGripVertical, type IconComponent } from 'twenty-ui/display';

import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { getNavigationMenuItemIconStyleFromColor } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';

const StyledIconSlot = styled.div<{ $hasFixedSize: boolean }>`
  align-items: center;
  cursor: grab;
  display: flex;
  flex-shrink: 0;
  justify-content: center;

  ${({ $hasFixedSize }) =>
    $hasFixedSize &&
    css`
      height: 16px;
      width: 16px;
    `}

  &:active {
    cursor: grabbing;
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
  const theme = useTheme();
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
};

export const AddToNavigationDragHandle = ({
  icon,
  customIconContent,
  payload,
  isHovered,
}: AddToNavigationDragHandleProps) => {
  const theme = useTheme();
  const iconColorFromPayload =
    payload.type === 'object' ? payload.iconColor : undefined;
  const iconStyle =
    payload.type === NavigationMenuItemType.RECORD
      ? null
      : getNavigationMenuItemIconStyleFromColor(
          theme,
          iconColorFromPayload ?? undefined,
        );
  const hasBackgroundColor = !!iconStyle && !isHovered;
  const showCustomContentWithoutWrapper = isDefined(customIconContent);

  return (
    <StyledIconSlot
      $hasFixedSize={
        !!iconStyle?.backgroundColor || showCustomContentWithoutWrapper
      }
    >
      {isHovered ? (
        <IconGripVertical
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.tertiary}
        />
      ) : showCustomContentWithoutWrapper ? (
        customIconContent
      ) : hasBackgroundColor && icon && !isDefined(customIconContent) ? (
        <NavigationMenuItemStyleIcon Icon={icon} color={iconColorFromPayload} />
      ) : hasBackgroundColor && iconStyle ? (
        <StyledNavigationMenuItemIconContainer
          $backgroundColor={iconStyle.backgroundColor}
          $borderColor={iconStyle.borderColor}
        >
          <AddToNavigationDragHandleIcon
            icon={icon}
            customIconContent={customIconContent}
            iconColor={iconStyle.iconColor}
          />
        </StyledNavigationMenuItemIconContainer>
      ) : (
        <AddToNavigationDragHandleIcon
          icon={icon}
          customIconContent={customIconContent}
        />
      )}
    </StyledIconSlot>
  );
};
