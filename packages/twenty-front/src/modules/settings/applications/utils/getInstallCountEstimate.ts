import { INSTALL_COUNT_ESTIMATE_THRESHOLD } from '@/settings/applications/constants/InstallCountEstimateThreshold';

export const getInstallCountEstimate = (
  installCount: number,
): number | undefined => {
  if (installCount < INSTALL_COUNT_ESTIMATE_THRESHOLD) {
    return undefined;
  }

  return (
    Math.floor(installCount / INSTALL_COUNT_ESTIMATE_THRESHOLD) *
    INSTALL_COUNT_ESTIMATE_THRESHOLD
  );
};
