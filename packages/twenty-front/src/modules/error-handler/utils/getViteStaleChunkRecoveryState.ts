type ViteStaleChunkRecoveryState = {
  shouldReload: boolean;
  retryCount: number;
};

export const getViteStaleChunkRecoveryState = (
  navigationType: string | undefined,
): ViteStaleChunkRecoveryState => {
  const isReloadNavigation = navigationType === 'reload';

  return {
    shouldReload: !isReloadNavigation,
    retryCount: isReloadNavigation ? 2 : 1,
  };
};
