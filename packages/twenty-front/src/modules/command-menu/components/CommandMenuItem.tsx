import { type CommandMenuItemProps } from '@/command-menu/types/CommandMenuItemProps';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { IconArrowUpRight, IconChevronRight } from 'twenty-ui/icon';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { hasUserSelectedSidePanelListItemState } from '@/side-panel/states/hasUserSelectedSidePanelListItemState';
import { useSelectableListNativeItemRef } from '@/ui/layout/selectable-list/hooks/useSelectableListNativeItemRef';
import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

const StyledIconContainer = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  padding: ${themeCssVariables.spacing[1]};

  svg {
    height: calc(${themeCssVariables.icon.size.md} * 1px);
    stroke-width: ${themeCssVariables.icon.stroke.sm};
    width: calc(${themeCssVariables.icon.size.md} * 1px);
  }
`;

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

const StyledSubmenuIconContainer = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: inline-flex;

  &[data-opened='true'] {
    transform: rotate(90deg);
  }

  &[data-disabled='true'] {
    visibility: hidden;
  }

  svg {
    height: calc(${themeCssVariables.icon.size.sm} * 1px);
    stroke-width: ${themeCssVariables.icon.stroke.sm};
    width: calc(${themeCssVariables.icon.size.sm} * 1px);
  }
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
  const { onItemClick } = useCommandMenuOnItemClick();

  if (isNonEmptyString(to) && !isDefined(Icon)) {
    Icon = IconArrowUpRight;
  }

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    id,
  );

  const nativeItemRef = useSelectableListNativeItemRef(id);

  const { setSelectedItemId } = useSelectableList();
  const setHasUserSelectedSidePanelListItem = useSetAtomState(
    hasUserSelectedSidePanelListItemState,
  );

  const hasAction = isDefined(onClick) || isNonEmptyString(to);
  const hasNativeOwner = hasAction || hasSubMenu;
  const hasTrailingActionContent = hasNativeOwner && isDefined(RightComponent);
  const hasTrailingSubmenuIndicator =
    hasTrailingActionContent && hasSubMenu && !hasAction;
  const submenuIndicator = hasSubMenu ? (
    <StyledSubmenuIconContainer
      aria-hidden
      data-opened={isSubMenuOpened}
      data-disabled={disabled}
    >
      <IconChevronRight />
    </StyledSubmenuIconContainer>
  ) : undefined;
  const descriptionPlacement =
    contextualTextPosition === 'right' ? ('end' as const) : ('inline' as const);

  const itemProps = {
    startIcon: isDefined(LeftComponent) ? (
      LeftComponent
    ) : isDefined(Icon) ? (
      <StyledIconContainer>
        <Icon />
      </StyledIconContainer>
    ) : undefined,
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

  const handleFocus = () => {
    setSelectedItemId(id);
    setHasUserSelectedSidePanelListItem(true);
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
