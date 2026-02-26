let preloadScheduled = false;

export const preloadWorkspaceDndKit = (): void => {
  if (preloadScheduled) {
    return;
  }
  preloadScheduled = true;

  const preload = () => {
    void import('@/navigation/components/WorkspaceDndKitProvider');
  };

  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(preload, { timeout: 4000 });
  } else {
    setTimeout(preload, 2000);
  }
};
