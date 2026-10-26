import { styled } from '@linaria/react';
import { lazy, Suspense } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isNavigationMenuItemAgentsSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAgentsSection';
import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';
import { isNavigationMenuItemSectionAboveContainerItems } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSectionAboveContainerItems';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { NavigationMenuItemAgentsSection } from '@/navigation-menu-item/display/sections/agents/components/NavigationMenuItemAgentsSection';
import { NavigationMenuItemAiChatSection } from '@/navigation-menu-item/display/sections/ai-chat/components/NavigationMenuItemAiChatSection';
import { NavigationMenuItemCustomSection } from '@/navigation-menu-item/display/sections/custom/components/NavigationMenuItemCustomSection';
import { NavigationMenuItemAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddSectionButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const LazyNavigationMenuSectionSortable = lazy(() =>
  import('@/navigation-menu-item/display/dnd/components/NavigationMenuSectionSortable').then(
    (module) => ({ default: module.NavigationMenuSectionSortable }),
  ),
);

const StyledSectionArea = styled.div`
  display: contents;
`;

const renderSectionContent = (section: NavigationMenuItem) => {
  if (isNavigationMenuItemAiChatSection(section)) {
    return <NavigationMenuItemAiChatSection section={section} />;
  }

  if (isNavigationMenuItemAgentsSection(section)) {
    return <NavigationMenuItemAgentsSection section={section} />;
  }

  return <NavigationMenuItemCustomSection section={section} />;
};

type NavigationMenuItemCustomSectionsProps = {
  parentId: string | null;
  placement: 'above-items' | 'below-items';
};

export const NavigationMenuItemCustomSections = ({
  parentId,
  placement,
}: NavigationMenuItemCustomSectionsProps) => {
  const isMobile = useIsMobile();
  const isAboveItems = placement === 'above-items';
  const allSections = useWorkspaceNavigationMenuSections(parentId);
  const sections = allSections.filter(
    (section) =>
      isNavigationMenuItemSectionAboveContainerItems(section) === isAboveItems,
  );
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isEditable = isLayoutCustomizationModeEnabled && !isMobile;

  return (
    <>
      {sections.map((section) => {
        const sectionContent = renderSectionContent(section);

        return isEditable ? (
          <Suspense key={section.id} fallback={sectionContent}>
            <LazyNavigationMenuSectionSortable
              section={section}
              index={allSections.indexOf(section)}
            >
              {sectionContent}
            </LazyNavigationMenuSectionSortable>
          </Suspense>
        ) : (
          <StyledSectionArea
            key={section.id}
            data-navigation-menu-section-id={section.id}
          >
            {sectionContent}
          </StyledSectionArea>
        );
      })}
      {!isAboveItems && isEditable && (
        <NavigationMenuItemAddSectionButton parentId={parentId} />
      )}
    </>
  );
};
