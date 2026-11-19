import { useLingui } from '@lingui/react/macro';
import {
  type BuiltInSectionKey,
  NavigationMenuItemType,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { navigationMenuItemsWithHiddenSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsWithHiddenSelector';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { getHiddenNavigationMenuItemsInTab } from '@/navigation-menu-item/common/utils/getHiddenNavigationMenuItemsInTab';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useRestoreHiddenNavigationMenuItem } from '@/navigation-menu-item/edit/hooks/useRestoreHiddenNavigationMenuItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type NavigationMenuAddSectionButtonProps = {
  containerId: string | null;
};

export const NavigationMenuAddSectionButton = ({
  containerId,
}: NavigationMenuAddSectionButtonProps) => {
  const { t } = useLingui();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const navigationMenuItemsWithHidden = useAtomStateValue(
    navigationMenuItemsWithHiddenSelector,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { createItem } = useNavigationMenuItemEditController('workspace');
  const { restoreHiddenNavigationMenuItem } =
    useRestoreHiddenNavigationMenuItem();
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );
  const { closeDropdown } = useCloseDropdown();
  const dropdownId = `navigation-menu-add-section-${containerId ?? 'home'}`;

  if (!isCustomizableSidebarEnabled) {
    return null;
  }

  const builtInSectionsToOffer = NAVIGATION_MENU_BUILT_IN_SECTIONS.filter(
    (builtInSection) =>
      (!builtInSection.isAi || (hasAiPermission && isAiChatInboxEnabled)) &&
      !(builtInSection.key === 'favorites' && containerId === null) &&
      !workspaceNavigationMenuItems.some(
        (item) =>
          item.builtInSectionKey === builtInSection.key &&
          (item.parentId ?? null) === containerId,
      ),
  );

  const hiddenNavigationMenuItems = getHiddenNavigationMenuItemsInTab({
    navigationMenuItems: filterWorkspaceNavigationMenuItems(
      navigationMenuItemsWithHidden,
    ),
    excludedIds: new Set(workspaceNavigationMenuItems.map(({ id }) => id)),
    tabId: containerId,
  });

  const getHiddenNavigationMenuItemLabel = (
    hiddenNavigationMenuItem: (typeof hiddenNavigationMenuItems)[number],
  ) => {
    const builtInSection = NAVIGATION_MENU_BUILT_IN_SECTIONS.find(
      ({ key }) => key === hiddenNavigationMenuItem.builtInSectionKey,
    );

    return isDefined(builtInSection)
      ? t(builtInSection.label)
      : getNavigationMenuItemLabel(
          hiddenNavigationMenuItem,
          objectMetadataItems,
          views,
        );
  };

  const handleHiddenNavigationMenuItemClick = (
    navigationMenuItemId: string,
  ) => {
    restoreHiddenNavigationMenuItem({
      navigationMenuItemId,
      fallbackParentId: containerId,
    });
    closeDropdown(dropdownId);
  };

  const handleCustomSectionClick = () => {
    const sectionId = createItem(
      { type: NavigationMenuItemType.SECTION, name: t`New section` },
      { targetFolderId: containerId },
    );
    setNavigationMenuItemIdToRename(sectionId);
    closeDropdown(dropdownId);
  };

  const handleBuiltInSectionClick = (builtInSectionKey: BuiltInSectionKey) => {
    createItem(
      { type: NavigationMenuItemType.SECTION, builtInSectionKey },
      { targetFolderId: containerId },
    );
    closeDropdown(dropdownId);
  };

  return (
    <NavigationDrawerSection>
      <NavigationMenuItemEntrance>
        <DropdownRoot dropdownId={dropdownId} type="menu">
          <Dropdown.Trigger
            nativeButton={false}
            render={
              <div tabIndex={-1}>
                <NavigationDrawerItem
                  Icon={IconPlus}
                  label={t`Add section`}
                  triggerEvent="CLICK"
                  variant="tertiary"
                />
              </div>
            }
          />
          <DropdownContent
            side="right"
            align="start"
            width={GenericDropdownContentWidth.Large}
          >
            <Dropdown.Section>
              <NavigationMenuItemSelectableItem
                item={{
                  id: NavigationMenuItemType.SECTION,
                  label: t`Custom section`,
                  Icon: IconPlus,
                  onClick: handleCustomSectionClick,
                }}
              />
              {builtInSectionsToOffer.map((builtInSection) => (
                <NavigationMenuItemSelectableItem
                  key={builtInSection.key}
                  item={{
                    id: builtInSection.key,
                    label: t(builtInSection.label),
                    onClick: () =>
                      handleBuiltInSectionClick(builtInSection.key),
                  }}
                />
              ))}
            </Dropdown.Section>
            {isNonEmptyArray(hiddenNavigationMenuItems) && (
              <>
                <Dropdown.Separator />
                <Dropdown.Section label={t`Hidden`}>
                  {hiddenNavigationMenuItems.map((hiddenNavigationMenuItem) => (
                    <NavigationMenuItemSelectableItem
                      key={hiddenNavigationMenuItem.id}
                      item={{
                        id: hiddenNavigationMenuItem.id,
                        label: getHiddenNavigationMenuItemLabel(
                          hiddenNavigationMenuItem,
                        ),
                        onClick: () =>
                          handleHiddenNavigationMenuItemClick(
                            hiddenNavigationMenuItem.id,
                          ),
                      }}
                    />
                  ))}
                </Dropdown.Section>
              </>
            )}
          </DropdownContent>
        </DropdownRoot>
      </NavigationMenuItemEntrance>
    </NavigationDrawerSection>
  );
};
