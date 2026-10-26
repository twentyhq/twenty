import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NAVIGATION_MENU_ITEM_COMMAND_KEYS } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_ITEM_COMMANDS } from '@/navigation-menu-item/common/constants/NavigationMenuItemCommands';
import { getNavigationMenuItemCommandKey } from '@/navigation-menu-item/common/utils/getNavigationMenuItemCommandKey';
import { useNavigationMenuItemCommandRunner } from '@/navigation-menu-item/display/command/hooks/useNavigationMenuItemCommandRunner';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { useWorkspaceSectionItemClickHandlers } from '@/navigation-menu-item/display/sections/workspace/hooks/useWorkspaceSectionItemClickHandlers';
import { NavigationMenuItemContainerTemplateMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerTemplateMenu';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
`;

type NavigationMenuItemCommandsSectionProps = {
  section: NavigationMenuItem;
};

export const NavigationMenuItemCommandsSection = ({
  section,
}: NavigationMenuItemCommandsSectionProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const items = useNavigationMenuItemSectionItems(section.id);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const {
    selectedNavigationMenuItemId,
    onNavigationMenuItemClick,
    onActiveObjectMetadataItemClick,
  } = useWorkspaceSectionItemClickHandlers();
  const { isCommandAvailable } = useNavigationMenuItemCommandRunner();
  const { pinCommand } = useCreateNavigationMenuTabOrSection();
  const navigationSectionId = `navigation-menu-section-${section.id}`;
  const { openNavigationSection } = useNavigationSection(navigationSectionId);

  const availableItems = isLayoutCustomizationModeEnabled
    ? items
    : items.filter((item) => {
        const commandKey = getNavigationMenuItemCommandKey(item);

        return isDefined(commandKey) && isCommandAvailable(commandKey);
      });

  if (!isLayoutCustomizationModeEnabled && availableItems.length === 0) {
    return null;
  }

  const defaultName = t`Commands`;
  const pinnedCommandKeys = new Set(
    items.map(getNavigationMenuItemCommandKey).filter(isDefined),
  );

  const editModeActions = (
    <StyledRightIconsContainer>
      <NavigationMenuItemContainerTemplateMenu
        dropdownId={`navigation-menu-pin-command-${section.id}`}
        title={t`Pin a command`}
        trigger={
          <LightIconButton
            emphasis="subtle"
            size="sm"
            aria-label={t`Pin a command`}
          >
            <IconPlus />
          </LightIconButton>
        }
        groups={[
          {
            id: 'commands',
            options: NAVIGATION_MENU_ITEM_COMMAND_KEYS.filter(
              isCommandAvailable,
            ).map((commandKey) => {
              const { label, Icon } = NAVIGATION_MENU_ITEM_COMMANDS[commandKey];
              const isAlreadyInSidebar = pinnedCommandKeys.has(commandKey);

              return {
                id: commandKey,
                label: t(label),
                Icon,
                isDisabled: isAlreadyInSidebar,
                isAlreadyInSidebar,
                onClick: () => {
                  openNavigationSection();
                  pinCommand({ sectionId: section.id, commandKey });
                },
              };
            }),
          },
        ]}
      />
      <NavigationMenuItemSectionMenu
        section={section}
        defaultName={defaultName}
      />
    </StyledRightIconsContainer>
  );

  return (
    <WorkspaceSectionContainer
      sectionTitle={section.name ?? defaultName}
      items={availableItems}
      containerId={section.id}
      navigationSectionId={navigationSectionId}
      visibleItemLimit={section.visibleItemLimit}
      isAddMenuItemButtonHidden
      rightIcon={
        !isMobile && isLayoutCustomizationModeEnabled
          ? editModeActions
          : undefined
      }
      selectedNavigationMenuItemId={selectedNavigationMenuItemId}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
  );
};
