import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { NavigationMenuItemCustomSection } from '@/navigation-menu-item/display/sections/custom/components/NavigationMenuItemCustomSection';

type NavigationMenuItemSectionsProps = {
  containerId: string | null;
};

export const NavigationMenuItemSections = ({
  containerId,
}: NavigationMenuItemSectionsProps) => {
  const sections = useWorkspaceNavigationMenuSections(containerId);

  return (
    <>
      {sections.map((section) => (
        <NavigationMenuItemCustomSection key={section.id} section={section} />
      ))}
    </>
  );
};
