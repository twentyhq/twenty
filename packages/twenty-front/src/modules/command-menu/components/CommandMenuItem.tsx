import { getCommandMenuItemStartIcon } from '@/command-menu/utils/getCommandMenuItemStartIcon';
import { type CommandMenuItemProps } from '@/command-menu/types/CommandMenuItemProps';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { styled } from '@linaria/react';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { IconArrowUpRight } from 'twenty-ui/icon';

import { useSidePanelListItemFocus } from '@/side-panel/hooks/useSidePanelListItemFocus';
import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { ListItemSubmenuIndicator } from '@/ui/navigation/list-item/components/ListItemSubmenuIndicator';
import { isDefined } from 'twenty-shared/utils';

const StyledActionRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  min-width: 0;
`;

const StyledTrailingContent = styled.div`
  align-items: center;
  display: flex;
  flex: none;
  gap: ${themeCssVariables.spacing[2]};
  padding-inline: ${themeCssVariables.spacing[1]};
`;

export const CommandMenuItem = ({
  label,
  description,
  contextualTextPosition = 'left',
  to,
  id,
  onClick,
  Icon,
  hotKeys,
  LeftComponent,
  RightComponent,
  hasSubMenu = false,
  isSubMenuOpened = false,
  disabled = false,
  'aria-controls': ariaControls,
}: CommandMenuItemProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { onItemClick } = useCommandMenuOnItemClick();

  if (isNonEmptyString(to) && !isDefined(Icon)) {
    Icon = IconArrowUpRight;
  }

  const { nativeItemRef, isSelectedItemId, handleFocus } =
    useSidePanelListItemFocus(id);

  const hasAction = isDefined(onClick) || isNonEmptyString(to);
  const hasNativeOwner = hasAction || hasSubMenu;
  const hasTrailingActionContent = hasNativeOwner && isDefined(RightComponent);
  const hasTrailingSubmenuIndicator =
    hasTrailingActionContent && hasSubMenu && !hasAction;
  const submenuIndicator = hasSubMenu ? (
    <ListItemSubmenuIndicator isOpen={isSubMenuOpened} disabled={disabled} />
  ) : undefined;
  const descriptionPlacement =
    contextualTextPosition === 'right' ? ('end' as const) : ('inline' as const);

  const itemProps = {
    startIcon: getCommandMenuItemStartIcon({
      LeftComponent,
      Icon,
      iconSize: theme.icon.size.md,
      iconStroke: theme.icon.stroke.sm,
    }),
    description,
    descriptionPlacement,
    shortcut: isDefined(hotKeys) ? hotKeys.map((key) => [key]) : undefined,
    shortcutJoinLabel: t`then`,
    focused: !disabled && isSelectedItemId,
    endIcon: (
      <>
        {!hasTrailingActionContent && RightComponent}
        {!hasTrailingSubmenuIndicator && submenuIndicator}
      </>
    ),
    disabled,
  };

  const item = hasNativeOwner ? (
    <ListItemButton
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...itemProps}
      ref={nativeItemRef}
      focusableWhenDisabled
      aria-expanded={hasSubMenu ? isSubMenuOpened : undefined}
      aria-controls={ariaControls}
      aria-haspopup={hasSubMenu ? true : undefined}
      onClick={hasAction ? () => onItemClick({ onClick, to }) : undefined}
      onFocus={handleFocus}
    >
      {label}
    </ListItemButton>
  ) : (
    <ListItem
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...itemProps}
      ref={nativeItemRef}
      tabIndex={-1}
      onFocus={handleFocus}
    >
      {label}
    </ListItem>
  );

  if (!hasTrailingActionContent) {
    return item;
  }

  return (
    <StyledActionRow>
      {item}
      <StyledTrailingContent>
        {RightComponent}
        {hasTrailingSubmenuIndicator && submenuIndicator}
      </StyledTrailingContent>
    </StyledActionRow>
  );
};
