let preloadScheduled = false;

const preload = () => {
  void import(
    '@/navigation-menu-item/display/dnd/providers/NavigationMenuItemDndKitProvider'
  );
  void import(
    '@/navigation-menu-item/display/sections/components/NavigationDrawerSectionForWorkspaceItemsListDndKit'
  );
};

export const preloadNavigationMenuItemDndKit = (): void => {
  if (preloadScheduled) {
    return;
  }
  preloadScheduled = true;
  preload();
};
