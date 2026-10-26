import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus, IconTool } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { useWorkspaceSectionItemClickHandlers } from '@/navigation-menu-item/display/sections/workspace/hooks/useWorkspaceSectionItemClickHandlers';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
`;

type NavigationMenuItemCustomSectionProps = {
  section: NavigationMenuItem;
};

export const NavigationMenuItemCustomSection = ({
  section,
}: NavigationMenuItemCustomSectionProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const items = useNavigationMenuItemSectionItems(section.id);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const {
    selectedNavigationMenuItemId,
    onNavigationMenuItemClick,
    onActiveObjectMetadataItemClick,
  } = useWorkspaceSectionItemClickHandlers();
  const navigationSectionId = `navigation-menu-section-${section.id}`;
  const { openNavigationSection } = useNavigationSection(navigationSectionId);

  if (!isLayoutCustomizationModeEnabled && items.length === 0) {
    return null;
  }

  const topLevelItemCount = items.filter(
    (item) => item.folderId === section.id,
  ).length;

  const editModeActions = (
    <StyledRightIconsContainer>
      <NavigationMenuItemAddDropdown
        instanceId={`section-header-${section.id}`}
        folderId={section.id}
        position={topLevelItemCount}
        onOpen={openNavigationSection}
      >
        <LightIconButton emphasis="subtle" size="sm" aria-label={t`Add`}>
          <IconPlus />
        </LightIconButton>
      </NavigationMenuItemAddDropdown>
      <NavigationMenuItemSectionMenu section={section} />
    </StyledRightIconsContainer>
  );

  const readModeActions = hasLayoutsPermission ? (
    <div onMouseEnter={preloadNavigationMenuItemDndKit}>
      <LightIconButton
        emphasis="subtle"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          enterLayoutCustomizationMode();
        }}
        aria-label={t`Edit navigation`}
      >
        <IconTool />
      </LightIconButton>
    </div>
  ) : undefined;

  return (
    <WorkspaceSectionContainer
      sectionTitle={section.name ?? ''}
      items={items}
      containerId={section.id}
      navigationSectionId={navigationSectionId}
      visibleItemLimit={section.visibleItemLimit}
      rightIcon={
        isMobile
          ? undefined
          : isLayoutCustomizationModeEnabled
            ? editModeActions
            : readModeActions
      }
      selectedNavigationMenuItemId={selectedNavigationMenuItemId}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
  );
};
