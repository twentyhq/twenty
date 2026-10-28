import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconChevronUp,
  IconChevronDown,
  IconFolderSymlink,
  IconRowInsertTop,
  IconRowInsertBottom,
  IconTrash,
} from 'twenty-ui/icon';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { type NavigationMenuItemAddTarget } from '@/navigation-menu-item/edit/types/NavigationMenuItemAddTarget';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { useNavigationMenuItemMoveDestinations } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveDestinations';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type NavigationMenuItemActionsProps = {
  item: NavigationMenuItem;
  section: NavigationMenuItemSection;
  onAdd: (target: NavigationMenuItemAddTarget) => void;
  onClose: () => void;
};
export const NavigationMenuItemActions = ({
  item,
  section,
  onAdd,
  onClose,
}: NavigationMenuItemActionsProps) => {
  const { t } = useLingui();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const moveToLabel = isCustomizableSidebarEnabled
    ? t`Move to`
    : t`Move to folder`;
  const { getSortedSiblings, moveUp, moveDown, moveToFolder, remove } =
    useNavigationMenuItemMoveRemove(section);
  const moveDestinationGroups = useNavigationMenuItemMoveDestinations({
    item,
    section,
  });
  const hasMoveDestination = moveDestinationGroups.some((group) =>
    group.destinations.some((destination) => !destination.isDisabled),
  );
  const { goToPage } = useDropdownPage();
  const siblings = getSortedSiblings(item.id) ?? [];
  const index = siblings.findIndex((sibling) => sibling.id === item.id);
  const run = (action: () => Promise<void>) => {
    void action();
    onClose();
  };
  const isCommand = item.type === NavigationMenuItemType.COMMAND;
  const actions: NavigationMenuItemOption[] = [
    {
      id: 'up',
      label: t`Move up`,
      Icon: IconChevronUp,
      isDisabled: index <= 0,
      onClick: () => run(() => moveUp(item.id)),
    },
    {
      id: 'down',
      label: t`Move down`,
      Icon: IconChevronDown,
      isDisabled: index < 0 || index === siblings.length - 1,
      onClick: () => run(() => moveDown(item.id)),
    },
    ...(isCommand
      ? []
      : [
          {
            id: 'move',
            label: moveToLabel,
            Icon: IconFolderSymlink,
            isDisabled: !hasMoveDestination,
            hasSubMenu: true,
            onClick: () => goToPage('move'),
          },
          {
            id: 'before',
            label: t`Add menu item before`,
            Icon: IconRowInsertTop,
            hasSubMenu: true,
            onClick: () =>
              onAdd({ folderId: item.folderId ?? undefined, position: index }),
          },
          {
            id: 'after',
            label: t`Add menu item after`,
            Icon: IconRowInsertBottom,
            hasSubMenu: true,
            onClick: () =>
              onAdd({
                folderId: item.folderId ?? undefined,
                position: index + 1,
              }),
          },
        ]),
    {
      id: 'remove',
      label: t`Remove from sidebar`,
      Icon: IconTrash,
      accent: 'danger',
      onClick: () => run(() => remove(item.id)),
    },
  ];
  return (
    <>
      <Dropdown.Page id="root">
        <Dropdown.Section>
          {actions.map((option) => (
            <NavigationMenuItemSelectableItem key={option.id} item={option} />
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
      <Dropdown.Page id="move">
        <Dropdown.Back>{moveToLabel}</Dropdown.Back>
        <Dropdown.Section scrollable>
          {moveDestinationGroups.map((group) => (
            <Dropdown.Section key={group.id} label={group.label}>
              {group.destinations.map((destination) => (
                <NavigationMenuItemSelectableItem
                  key={destination.id ?? 'root'}
                  item={{
                    id: destination.id ?? 'root',
                    label: destination.label,
                    icon: (
                      <ColoredIcon
                        Icon={destination.Icon}
                        color={destination.iconColor}
                      />
                    ),
                    isDisabled: destination.isDisabled,
                    contextualText: destination.contextualText,
                    onClick: () =>
                      run(() => moveToFolder(item.id, destination.id)),
                  }}
                />
              ))}
            </Dropdown.Section>
          ))}
        </Dropdown.Section>
      </Dropdown.Page>
    </>
  );
};
