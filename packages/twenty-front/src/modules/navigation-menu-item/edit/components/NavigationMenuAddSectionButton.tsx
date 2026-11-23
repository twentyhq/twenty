import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  type BuiltInSectionKey,
  NavigationMenuItemType,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { NAVIGATION_MENU_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuBuiltInSections';
import { canAddBuiltInSectionToContainer } from '@/navigation-menu-item/common/utils/canAddBuiltInSectionToContainer';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { useAreAiChatSectionsAvailable } from '@/navigation-menu-item/display/hooks/useAreAiChatSectionsAvailable';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { NavigationMenuAddSectionHiddenItems } from '@/navigation-menu-item/edit/components/NavigationMenuAddSectionHiddenItems';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useHiddenNavigationMenuItemsInTab } from '@/navigation-menu-item/edit/hooks/useHiddenNavigationMenuItemsInTab';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledAddSectionIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

type NavigationMenuAddSectionButtonProps = {
  containerId: string | null;
};

export const NavigationMenuAddSectionButton = ({
  containerId,
}: NavigationMenuAddSectionButtonProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const areAiChatSectionsAvailable = useAreAiChatSectionsAvailable();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const hiddenNavigationMenuItems =
    useHiddenNavigationMenuItemsInTab(containerId);
  const { createItem } = useNavigationMenuItemEditController('workspace');
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );
  const { closeDropdown } = useCloseDropdown();
  const { toggleDropdown } = useToggleDropdown();
  const dropdownId = `navigation-menu-add-section-${containerId ?? 'home'}`;

  if (!isCustomizableSidebarEnabled) {
    return null;
  }

  const builtInSectionsToOffer = NAVIGATION_MENU_BUILT_IN_SECTIONS.filter(
    (builtInSection) =>
      (!builtInSection.isAi || areAiChatSectionsAvailable) &&
      canAddBuiltInSectionToContainer({
        builtInSectionKey: builtInSection.key,
        containerId,
        items: [...workspaceNavigationMenuItems, ...hiddenNavigationMenuItems],
      }),
  );

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
              <div>
                <NavigationDrawerSectionTitle
                  label={t`Add section`}
                  onClick={() =>
                    toggleDropdown({
                      dropdownComponentInstanceIdFromProps: dropdownId,
                    })
                  }
                  rightIcon={
                    <StyledAddSectionIcon>
                      <IconPlus size="12px" stroke={theme.icon.stroke.lg} />
                    </StyledAddSectionIcon>
                  }
                  alwaysShowRightIcon
                />
              </div>
            }
          />
          <DropdownContent
            side="right"
            align="start"
            width={GenericDropdownContentWidth.Large}
          >
            {isNonEmptyArray(builtInSectionsToOffer) && (
              <>
                <Dropdown.Section>
                  {builtInSectionsToOffer.map((builtInSection) => (
                    <NavigationMenuItemSelectableItem
                      key={builtInSection.key}
                      item={{
                        id: builtInSection.key,
                        label: t(builtInSection.label),
                        icon: (
                          <ColoredIcon
                            Icon={builtInSection.Icon}
                            color={builtInSection.color}
                          />
                        ),
                        onClick: () =>
                          handleBuiltInSectionClick(builtInSection.key),
                      }}
                    />
                  ))}
                </Dropdown.Section>
                <Dropdown.Separator />
              </>
            )}
            <Dropdown.Section>
              <NavigationMenuItemSelectableItem
                item={{
                  id: NavigationMenuItemType.SECTION,
                  label: t`Custom section`,
                  Icon: IconPlus,
                  onClick: handleCustomSectionClick,
                }}
              />
            </Dropdown.Section>
            <NavigationMenuAddSectionHiddenItems
              containerId={containerId}
              dropdownId={dropdownId}
            />
          </DropdownContent>
        </DropdownRoot>
      </NavigationMenuItemEntrance>
    </NavigationDrawerSection>
  );
};
