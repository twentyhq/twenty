import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useReducedMotion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
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
import { isNavigationMenuAddSectionRequestedState } from '@/navigation-menu-item/common/states/isNavigationMenuAddSectionRequestedState';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { useNavigationMenuBuiltInSectionAvailability } from '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { NavigationMenuAddSectionHiddenItems } from '@/navigation-menu-item/edit/components/NavigationMenuAddSectionHiddenItems';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useHiddenNavigationMenuItemsInTab } from '@/navigation-menu-item/edit/hooks/useHiddenNavigationMenuItemsInTab';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledAddSectionIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};

  .section-title-container:hover & {
    color: ${themeCssVariables.font.color.secondary};
  }
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
  const { isBuiltInSectionAvailable } =
    useNavigationMenuBuiltInSectionAvailability();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const hiddenNavigationMenuItems =
    useHiddenNavigationMenuItemsInTab(containerId);
  const { createItem } = useNavigationMenuItemEditController('workspace');
  const setNavigationMenuItemIdToRename = useSetAtomState(
    navigationMenuItemIdToRenameState,
  );
  const { closeDropdown } = useCloseDropdown();
  const { openDropdown } = useOpenDropdown();
  const dropdownId = `navigation-menu-add-section-${containerId ?? 'home'}`;
  const triggerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [hasEntered, setHasEntered] = useState(false);
  const [
    isNavigationMenuAddSectionRequested,
    setIsNavigationMenuAddSectionRequested,
  ] = useAtomState(isNavigationMenuAddSectionRequestedState);

  const scrollTriggerIntoView = useCallback(() => {
    triggerRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  if (!isCustomizableSidebarEnabled) {
    return null;
  }

  const builtInSectionsToOffer = NAVIGATION_MENU_BUILT_IN_SECTIONS.filter(
    (builtInSection) =>
      isBuiltInSectionAvailable(builtInSection.key) &&
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
      <NavigationMenuItemEntrance onEntered={() => setHasEntered(true)}>
        <DropdownRoot
          dropdownId={dropdownId}
          type="menu"
          onOpenChange={(open) => {
            if (!open && isNavigationMenuAddSectionRequested) {
              setIsNavigationMenuAddSectionRequested(false);
            }
          }}
        >
          {isNavigationMenuAddSectionRequested &&
            (hasEntered || shouldReduceMotion === true) && (
              <NavigationMenuItemDropdownOpenEffect
                dropdownId={dropdownId}
                onOpen={scrollTriggerIntoView}
              />
            )}
          <Dropdown.Trigger
            nativeButton={false}
            render={
              <div ref={triggerRef}>
                <NavigationDrawerSectionTitle
                  label={t`Add section`}
                  onClick={() =>
                    openDropdown({
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
            width={GenericDropdownContentWidth.ExtraLarge}
            aria-label={t`Add section`}
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
