import { Fragment, lazy, Suspense } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isNavigationMenuItemAiChatSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemAiChatSection';
import { isNavigationMenuItemSectionAboveContainerItems } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSectionAboveContainerItems';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { NavigationMenuItemAiChatSection } from '@/navigation-menu-item/display/sections/ai-chat/components/NavigationMenuItemAiChatSection';
import { NavigationMenuItemCustomSection } from '@/navigation-menu-item/display/sections/custom/components/NavigationMenuItemCustomSection';
import { NavigationMenuItemAddSectionButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddSectionButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const LazyNavigationMenuSectionSortable = lazy(() =>
  import('@/navigation-menu-item/display/dnd/components/NavigationMenuSectionSortable').then(
    (module) => ({ default: module.NavigationMenuSectionSortable }),
  ),
);

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
        const sectionContent = isNavigationMenuItemAiChatSection(section) ? (
          <NavigationMenuItemAiChatSection section={section} />
        ) : (
          <NavigationMenuItemCustomSection section={section} />
        );

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
          <Fragment key={section.id}>{sectionContent}</Fragment>
        );
      })}
      {!isAboveItems && isEditable && (
        <NavigationMenuItemAddSectionButton parentId={parentId} />
      )}
    </>
  );
};
