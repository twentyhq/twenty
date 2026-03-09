let preloadScheduled = false;

const preload = () => {
  void import('@/navigation/components/WorkspaceDndKitProvider');
  void import(
    '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsListDndKit'
  );
};

export const preloadWorkspaceDndKit = (): void => {
  if (preloadScheduled) {
    return;
  }
  preloadScheduled = true;
  preload();
};
